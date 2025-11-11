from __future__ import annotations
import logging
import re
from typing import Any, Dict, Optional, Text, List, Set

from rasa.engine.graph import GraphComponent, ExecutionContext
from rasa.engine.recipes.default_recipe import DefaultV1Recipe
from rasa.engine.storage.resource import Resource
from rasa.engine.storage.storage import ModelStorage
from rasa.shared.constants import DOCS_URL_COMPONENTS
from rasa.nlu.classifiers.classifier import IntentClassifier
from rasa.shared.nlu.constants import (
    INTENT,
    TEXT,
    INTENT_NAME_KEY,
    PREDICTED_CONFIDENCE_KEY,
)
import rasa.shared.utils.io
from rasa.shared.nlu.training_data.training_data import TrainingData
from rasa.shared.nlu.training_data.message import Message

logger = logging.getLogger(__name__)


@DefaultV1Recipe.register(
    DefaultV1Recipe.ComponentType.INTENT_CLASSIFIER, is_trainable=True
)
class RestrictedKeywordIntentClassifier(GraphComponent, IntentClassifier):
    """Keyword-based intent classifier restricted to selected intents.

    This classifier mirrors Rasa's built-in KeywordIntentClassifier but only
    learns keywords from a configurable list of `allowed_intents`. It also
    supports filtering short/ambiguous keywords via `min_keyword_length` and
    a configurable `blocklist_keywords`.
    """

    @staticmethod
    def get_default_config() -> Dict[Text, Any]:
        return {
            "case_sensitive": False,
            "allowed_intents": ["affirm", "goodbye"],
            "min_keyword_length": 4,  # characters
            # prevent short/ambiguous acknowledgements from acting as strong keywords
            "blocklist_keywords": [
                "ya", "iya", "oke", "ok", "baik", "sip", "betul", "benar",
                # 'thanks' family often appears in goodbye closers; block as keywords
                "terima kasih", "makasih", "thanks", "thank you", "tq", "tengkyu"
            ],
        }

    def __init__(
        self,
        config: Dict[Text, Any],
        model_storage: ModelStorage,
        resource: Resource,
        execution_context: ExecutionContext,
        intent_keyword_map: Optional[Dict] = None,
    ) -> None:
        self.component_config = config
        self._model_storage = model_storage
        self._resource = resource
        self._execution_context = execution_context

        self.case_sensitive = bool(self.component_config.get("case_sensitive", False))
        self.allowed_intents: Set[Text] = set(self.component_config.get("allowed_intents", []))
        self.min_keyword_length: int = int(self.component_config.get("min_keyword_length", 0))
        self.blocklist_keywords: Set[Text] = set(self.component_config.get("blocklist_keywords", []))

        self.intent_keyword_map = intent_keyword_map or {}

    @classmethod
    def create(
        cls,
        config: Dict[Text, Any],
        model_storage: ModelStorage,
        resource: Resource,
        execution_context: ExecutionContext,
    ) -> "RestrictedKeywordIntentClassifier":
        return cls(config, model_storage, resource, execution_context)

    def _is_valid_keyword(self, text: Text) -> bool:
        t = (text or "").strip()
        if not t:
            return False
        if t.lower() in self.blocklist_keywords:
            return False
        if len(t) < self.min_keyword_length:
            return False
        return True

    def train(self, training_data: TrainingData) -> Resource:
        duplicate_examples = set()
        for ex in training_data.intent_examples:
            intent = ex.get(INTENT)
            text = ex.get(TEXT)
            if intent not in self.allowed_intents:
                continue
            if not self._is_valid_keyword(text):
                continue

            if (
                text in self.intent_keyword_map.keys()
                and intent != self.intent_keyword_map[text]
            ):
                duplicate_examples.add(text)
                rasa.shared.utils.io.raise_warning(
                    f"Keyword '{text}' is a keyword to trigger intent "
                    f"'{self.intent_keyword_map[text]}' and also intent '{intent}', "
                    f"it will be removed from the list of keywords for both of them.",
                    docs=DOCS_URL_COMPONENTS + "#keyword-intent-classifier",
                )
            else:
                self.intent_keyword_map[text] = intent

        for keyword in duplicate_examples:
            self.intent_keyword_map.pop(keyword)
            logger.debug(
                f"Removed '{keyword}' from keywords because it was a keyword for more than one intent."
            )

        self._validate_keyword_map()
        self.persist()
        return self._resource

    def _validate_keyword_map(self) -> None:
        re_flag = 0 if self.case_sensitive else re.IGNORECASE

        ambiguous_mappings = []
        for keyword1, intent1 in list(self.intent_keyword_map.items()):
            for keyword2, intent2 in list(self.intent_keyword_map.items()):
                if (
                    re.search(r"\b" + re.escape(keyword1) + r"\b", keyword2, flags=re_flag)
                    and intent1 != intent2
                ):
                    ambiguous_mappings.append((intent1, keyword1))
                    rasa.shared.utils.io.raise_warning(
                        f"Keyword '{keyword1}' is a keyword of intent '{intent1}', "
                        f"but also a substring of '{keyword2}', which is a keyword of intent '{intent2}'. "
                        f"'{keyword1}' will be removed from the list of keywords.",
                        docs=DOCS_URL_COMPONENTS + "#keyword-intent-classifier",
                    )
        for intent, keyword in ambiguous_mappings:
            self.intent_keyword_map.pop(keyword, None)
            logger.debug(
                f"Removed keyword '{keyword}' from intent '{intent}' because it matched a keyword of another intent."
            )

    def process(self, messages: List[Message]) -> List[Message]:
        for message in messages:
            intent_name = self._map_keyword_to_intent(message.get(TEXT))
            confidence = 0.0 if intent_name is None else 1.0
            intent = {INTENT_NAME_KEY: intent_name, PREDICTED_CONFIDENCE_KEY: confidence}

            # Only set intent when we find a match, otherwise don't override
            # previous classifier outputs.
            if intent_name is not None:
                message.set(INTENT, intent, add_to_output=True)

        return messages

    def _map_keyword_to_intent(self, text: Text) -> Optional[Text]:
        re_flag = 0 if self.case_sensitive else re.IGNORECASE
        for keyword, intent in self.intent_keyword_map.items():
            try:
                if re.search(r"\b" + re.escape(keyword) + r"\b", text or "", flags=re_flag):
                    logger.debug(
                        f"RestrictedKeywordClassifier matched keyword '{keyword}' to intent '{intent}'."
                    )
                    return intent
            except re.error:
                # Skip invalid regex patterns (should not happen but be defensive)
                logger.debug(f"Invalid regex for keyword '{keyword}', skipping.")
                continue
        return None

    def persist(self) -> None:
        with self._model_storage.write_to(self._resource) as model_dir:
            file_name = f"{self.__class__.__name__}.json"
            keyword_file = model_dir / file_name
            rasa.shared.utils.io.dump_obj_as_json_to_file(keyword_file, self.intent_keyword_map)

    @classmethod
    def load(
        cls,
        config: Dict[Text, Any],
        model_storage: ModelStorage,
        resource: Resource,
        execution_context: ExecutionContext,
        **kwargs: Any,
    ) -> "RestrictedKeywordIntentClassifier":
        try:
            with model_storage.read_from(resource) as model_dir:
                keyword_file = model_dir / f"{cls.__name__}.json"
                intent_keyword_map = rasa.shared.utils.io.read_json_file(keyword_file)
        except ValueError:
            logger.warning(
                f"Failed to load {cls.__name__} from model storage. Resource '{resource.name}' doesn't exist."
            )
            intent_keyword_map = None
        return cls(config, model_storage, resource, execution_context, intent_keyword_map)
