import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter

def analyze_user_conversations():
    """Analisis data conversasi user"""
    
    print("="*60)
    print("📊 ANALISIS DATA USER CONVERSATIONS")
    print("="*60)
    
    try:
        df = pd.read_csv('user_conversations_log.csv')
    except FileNotFoundError:
        print("❌ File user_conversations_log.csv tidak ditemukan!")
        print("Jalankan chatbot dulu untuk collect data.")
        return
    
    print(f"\n✅ Total conversations logged: {len(df)}")
    print(f"✅ Unique users: {df['user_id'].nunique()}")
    print(f"✅ Date range: {df['timestamp'].min()} to {df['timestamp'].max()}")
    
    # 1. Intent Distribution
    print("\n" + "="*60)
    print("📈 DISTRIBUSI INTENT")
    print("="*60)
    intent_counts = df['predicted_intent'].value_counts()
    print(intent_counts)
    
    # 2. Low Confidence Messages
    print("\n" + "="*60)
    print("⚠️  MESSAGES DENGAN CONFIDENCE RENDAH (<60%)")
    print("="*60)
    low_conf = df[df['confidence_score'] < 0.6]
    print(f"Total: {len(low_conf)} messages ({len(low_conf)/len(df)*100:.1f}%)")
    
    if len(low_conf) > 0:
        print("\nContoh messages yang perlu ditambahkan ke training data:")
        for idx, row in low_conf.head(10).iterrows():
            print(f"  • '{row['user_message']}' → predicted as '{row['predicted_intent']}' (conf: {row['confidence_score']:.2%})")
    
    # 3. Average Confidence per Intent
    print("\n" + "="*60)
    print("📊 AVERAGE CONFIDENCE PER INTENT")
    print("="*60)
    avg_conf = df.groupby('predicted_intent')['confidence_score'].agg(['mean', 'count']).sort_values('mean')
    print(avg_conf)
    
    # 4. Messages yang perlu di-review
    print("\n" + "="*60)
    print("🔍 TOP 20 MESSAGES UNTUK DITAMBAH KE TRAINING DATA")
    print("="*60)
    
    # Ambil messages dengan confidence 0.4-0.7 (borderline)
    borderline = df[(df['confidence_score'] >= 0.4) & (df['confidence_score'] < 0.7)]
    
    if len(borderline) > 0:
        print("\nINTENT | CONFIDENCE | USER MESSAGE")
        print("-" * 60)
        for idx, row in borderline.sort_values('confidence_score').head(20).iterrows():
            print(f"{row['predicted_intent'][:20]:20} | {row['confidence_score']:.2%} | {row['user_message']}")
    
    # 5. Generate NLU training data dari low confidence
    print("\n" + "="*60)
    print("🤖 GENERATE NLU TRAINING DATA")
    print("="*60)
    
    generate_training_data(low_conf)
    
    # 6. Visualisasi
    create_visualizations(df)
    
    print("\n" + "="*60)
    print("✅ ANALISIS SELESAI!")
    print("="*60)
    print("\n📁 File yang dihasilkan:")
    print("  • suggested_training_data.yml - Tambahkan ke data/nlu.yml")
    print("  • intent_distribution.png - Visualisasi distribusi intent")
    print("  • confidence_distribution.png - Visualisasi confidence scores")


def generate_training_data(low_conf_df):
    """Generate suggested training data dari low confidence messages"""
    
    if len(low_conf_df) == 0:
        print("Tidak ada low confidence messages untuk diconvert.")
        return
    
    output = []
    output.append("# ========== SUGGESTED TRAINING DATA ==========")
    output.append("# Review dan tambahkan ke data/nlu.yml setelah memverifikasi intent-nya benar\n")
    output.append("version: \"3.1\"\n")
    output.append("nlu:")
    
    # Group by intent
    grouped = low_conf_df.groupby('predicted_intent')
    
    for intent, group in grouped:
        if len(group) == 0:
            continue
            
        output.append(f"\n- intent: {intent}")
        output.append("  examples: |")
        
        for idx, row in group.iterrows():
            message = row['user_message'].strip()
            if message and len(message) > 3:  # Filter out very short messages
                output.append(f"    - {message}")
    
    # Save to file
    with open('suggested_training_data.yml', 'w', encoding='utf-8') as f:
        f.write('\n'.join(output))
    
    print(f"✅ Generated {len(low_conf_df)} suggested training examples")
    print("📝 Saved to: suggested_training_data.yml")


def create_visualizations(df):
    """Create visualizations dari data"""
    
    try:
        # 1. Intent Distribution
        plt.figure(figsize=(12, 6))
        intent_counts = df['predicted_intent'].value_counts()
        sns.barplot(x=intent_counts.values, y=intent_counts.index)
        plt.title('Distribution of Predicted Intents')
        plt.xlabel('Count')
        plt.ylabel('Intent')
        plt.tight_layout()
        plt.savefig('intent_distribution.png', dpi=300, bbox_inches='tight')
        print("✅ Saved: intent_distribution.png")
        
        # 2. Confidence Distribution
        plt.figure(figsize=(10, 6))
        plt.hist(df['confidence_score'], bins=50, edgecolor='black')
        plt.axvline(x=0.6, color='r', linestyle='--', label='Low Confidence Threshold')
        plt.axvline(x=df['confidence_score'].mean(), color='g', linestyle='--', label=f'Mean: {df["confidence_score"].mean():.2f}')
        plt.title('Distribution of Confidence Scores')
        plt.xlabel('Confidence Score')
        plt.ylabel('Frequency')
        plt.legend()
        plt.tight_layout()
        plt.savefig('confidence_distribution.png', dpi=300, bbox_inches='tight')
        print("✅ Saved: confidence_distribution.png")
        
        plt.close('all')
        
    except Exception as e:
        print(f"⚠️  Warning: Could not create visualizations: {e}")


def analyze_conversation_quality():
    """Analisis kualitas conversation"""
    
    print("\n" + "="*60)
    print("📊 ANALISIS KUALITAS CONVERSATION")
    print("="*60)
    
    try:
        df = pd.read_csv('conversation_quality_log.csv')
    except FileNotFoundError:
        print("❌ File conversation_quality_log.csv tidak ditemukan!")
        return
    
    print(f"\n✅ Total conversations: {len(df)}")
    print(f"\n📈 METRICS:")
    print(f"  • Average messages per conversation: {df['total_messages'].mean():.1f}")
    print(f"  • Average fallback rate: {df['fallback_rate'].mean():.2%}")
    print(f"  • Average low confidence rate: {df['low_confidence_rate'].mean():.2%}")
    
    # Identifikasi problematic conversations
    problematic = df[
        (df['fallback_rate'] > 0.3) | 
        (df['low_confidence_rate'] > 0.4)
    ]
    
    if len(problematic) > 0:
        print(f"\n⚠️  Problematic conversations: {len(problematic)}")
        print("\nTop 5 conversations yang perlu improvement:")
        print(problematic.sort_values('fallback_rate', ascending=False).head())


if __name__ == '__main__':
    analyze_user_conversations()
    analyze_conversation_quality()