from __future__ import annotations
import logging
from typing import Any, Dict, List, Text

import numpy as np

from rasa.engine.graph import GraphComponent, ExecutionContext
from rasa.engine.recipes.default_recipe import DefaultV1Recipe
from rasa.engine.storage.resource import Resource
from rasa.engine.storage.storage import ModelStorage
from rasa.shared.nlu.training_data.message import Message
from rasa.shared.nlu.training_data.training_data import TrainingData

logger = logging.getLogger(__name__)


@DefaultV1Recipe.register(
    DefaultV1Recipe.ComponentType.MESSAGE_FEATURIZER, is_trainable=False
)
class IntentConfidenceCalibrator(GraphComponent):
    """Post-processing component to calibrate intent confidences.

    This component adjusts the confidence scores produced by upstream
    intent classifiers using temperature scaling and an optional cap.
    It preserves ranking order but reduces overconfident peaks to make
    downstream fallback and policies behave more conservatively.
    """

    @staticmethod
    def get_default_config() -> Dict[Text, Any]:
        return {
            # >1.0 decreases confidence by flattening distribution
            "temperature": 1.6,
            # cap the maximum confidence for any intent
            "max_confidence": 0.92,
            # ignore tiny probabilities to avoid numerical noise
            "min_confidence": 1e-6,
        }

    def __init__(
        self,
        config: Dict[Text, Any],
        model_storage: ModelStorage,
        resource: Resource,
        execution_context: ExecutionContext,
    ) -> None:
        self.component_config = config

    @classmethod
    def create(
        cls,
        config: Dict[Text, Any],
        model_storage: ModelStorage,
        resource: Resource,
        execution_context: ExecutionContext,
    ) -> "IntentConfidenceCalibrator":
        return cls(config, model_storage, resource, execution_context)

    def process(self, messages: List[Message], **kwargs: Any) -> List[Message]:
        T = float(self.component_config.get("temperature", 1.6))
        max_c = float(self.component_config.get("max_confidence", 0.92))
        min_c = float(self.component_config.get("min_confidence", 1e-6))

        for message in messages:
            ranking: List[Dict[Text, Any]] = message.get("intent_ranking") or []
            top_intent: Dict[Text, Any] = message.get("intent") or {}

            if not ranking or "confidence" not in top_intent:
                continue

            try:
                names = [r.get("name") for r in ranking]
                probs = np.array([max(float(r.get("confidence", 0.0)), 0.0) for r in ranking], dtype=np.float32)

                # Temperature scaling on probabilities; preserve order
                # p' = (p ** (1/T)) / sum(p ** (1/T))
                exps = np.power(probs + min_c, 1.0 / max(T, 1e-3))
                denom = float(np.sum(exps))
                if denom <= 0.0:
                    continue

                calibrated = exps / denom
                # cap maximum confidence
                calibrated = np.minimum(calibrated, max_c)

                # rebuild ranking
                new_ranking = [{"name": n, "confidence": float(c)} for n, c in zip(names, calibrated)]
                message.set("intent_ranking", new_ranking)

                top_idx = int(np.argmax(calibrated))
                message.set("intent", {"name": names[top_idx], "confidence": float(calibrated[top_idx])})
            except Exception as e:
                logger.exception(f"IntentConfidenceCalibrator failed: {e}")
                continue

        return messages

    # no-op during training to satisfy graph validation
    def process_training_data(self, training_data: TrainingData) -> TrainingData:
        return training_data
