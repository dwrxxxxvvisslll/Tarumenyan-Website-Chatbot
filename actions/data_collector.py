from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from datetime import datetime
import json
import csv
import os

class ActionLogUserInput(Action):
    """Log semua user input untuk analisis & improvement"""
    
    def name(self) -> Text:
        return "action_log_user_input"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Ambil data user
        user_message = tracker.latest_message.get('text', '')
        intent = tracker.latest_message.get('intent', {}).get('name', 'unknown')
        confidence = tracker.latest_message.get('intent', {}).get('confidence', 0)
        entities = tracker.latest_message.get('entities', [])
        
        # Data yang akan disimpan
        log_data = {
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'user_id': tracker.sender_id,
            'user_message': user_message,
            'predicted_intent': intent,
            'confidence_score': round(confidence, 4),
            'entities': str(entities),
            'correct_prediction': 'unknown'  # Bisa diupdate manual nanti
        }
        
        # Simpan ke CSV untuk analisis
        filename = 'user_conversations_log.csv'
        file_exists = os.path.isfile(filename)
        
        try:
            with open(filename, 'a', newline='', encoding='utf-8') as f:
                fieldnames = ['timestamp', 'user_id', 'user_message', 
                            'predicted_intent', 'confidence_score', 
                            'entities', 'correct_prediction']
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                
                if not file_exists:
                    writer.writeheader()
                
                writer.writerow(log_data)
        except Exception as e:
            print(f"Error logging data: {e}")
        
        # Jika confidence rendah, kasih feedback
        if confidence < 0.6:
            dispatcher.utter_message(
                text=f"🤔 Saya kurang yakin dengan maksud Anda (confidence: {confidence:.2%}). "
                     "Bisa diulang dengan kalimat lain?"
            )
        
        return []


class ActionCollectFeedback(Action):
    """Collect feedback apakah response bot sudah benar"""
    
    def name(self) -> Text:
        return "action_collect_feedback"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Tanya feedback ke user
        dispatcher.utter_message(
            text="Apakah jawaban saya sudah membantu? 👍/👎\n"
                 "(Ketik: sudah membantu / kurang membantu)"
        )
        
        return []


class ActionAnalyzeConversationQuality(Action):
    """Analisis kualitas conversation untuk improvement"""
    
    def name(self) -> Text:
        return "action_analyze_conversation_quality"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        events = tracker.events
        
        # Hitung metrics
        total_messages = len([e for e in events if e.get('event') == 'user'])
        total_fallbacks = len([e for e in events if e.get('name') == 'action_default_fallback'])
        
        low_confidence_count = 0
        for event in events:
            if event.get('event') == 'user':
                intent = event.get('parse_data', {}).get('intent', {})
                confidence = intent.get('confidence', 1)
                if confidence < 0.7:
                    low_confidence_count += 1
        
        # Save conversation quality
        quality_data = {
            'conversation_id': tracker.sender_id,
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'total_messages': total_messages,
            'total_fallbacks': total_fallbacks,
            'low_confidence_predictions': low_confidence_count,
            'fallback_rate': round(total_fallbacks / max(total_messages, 1), 4),
            'low_confidence_rate': round(low_confidence_count / max(total_messages, 1), 4)
        }
        
        filename = 'conversation_quality_log.csv'
        file_exists = os.path.isfile(filename)
        
        try:
            with open(filename, 'a', newline='', encoding='utf-8') as f:
                fieldnames = list(quality_data.keys())
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                
                if not file_exists:
                    writer.writeheader()
                
                writer.writerow(quality_data)
        except Exception as e:
            print(f"Error logging quality data: {e}")
        
        return []