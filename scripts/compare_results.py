import json
import pandas as pd
from datetime import datetime

def compare_test_results():
    """Compare hasil test untuk dokumentasi skripsi"""
    
    print("="*60)
    print("📊 COMPARISON OF MODEL IMPROVEMENTS")
    print("="*60)
    
    try:
        with open('results/intent_report.json', 'r') as f:
            current_results = json.load(f)
        
        # Extract metrics
        accuracy = current_results.get('accuracy', 0)
        weighted_avg = current_results.get('weighted avg', {})
        
        f1_score = weighted_avg.get('f1-score', 0)
        precision = weighted_avg.get('precision', 0)
        recall = weighted_avg.get('recall', 0)
        
        print(f"\n📈 CURRENT MODEL PERFORMANCE:")
        print(f"  • Accuracy:  {accuracy:.4f} ({accuracy*100:.2f}%)")
        print(f"  • F1-Score:  {f1_score:.4f} ({f1_score*100:.2f}%)")
        print(f"  • Precision: {precision:.4f} ({precision*100:.2f}%)")
        print(f"  • Recall:    {recall:.4f} ({recall*100:.2f}%)")
        
        # Save ke improvement log
        log_entry = {
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'accuracy': accuracy,
            'f1_score': f1_score,
            'precision': precision,
            'recall': recall
        }
        
        # Append to log
        try:
            df = pd.read_csv('improvement_log.csv')
            df = pd.concat([df, pd.DataFrame([log_entry])], ignore_index=True)
        except FileNotFoundError:
            df = pd.DataFrame([log_entry])
        
        df.to_csv('improvement_log.csv', index=False)
        
        # Show improvement over time
        if len(df) > 1:
            print(f"\n📈 IMPROVEMENT OVER TIME:")
            print(df.to_string(index=False))
            
            # Calculate improvement
            first_f1 = df.iloc[0]['f1_score']
            latest_f1 = df.iloc[-1]['f1_score']
            improvement = latest_f1 - first_f1
            
            print(f"\n🎯 TOTAL IMPROVEMENT:")
            print(f"  • F1-Score: {first_f1:.4f} → {latest_f1:.4f} (+{improvement:.4f})")
            print(f"  • Percentage: {improvement/first_f1*100:+.2f}%")
            
            if latest_f1 >= 0.85:
                print(f"\n🎉 TARGET TERCAPAI! F1-Score >= 85%")
            else:
                target_gap = 0.85 - latest_f1
                print(f"\n📊 Progress to Target (85%):")
                print(f"  • Current: {latest_f1*100:.2f}%")
                print(f"  • Gap: {target_gap*100:.2f}%")
                print(f"  • Need: ~{int(target_gap * 1000)} more training examples")
        
    except FileNotFoundError:
        print("❌ Results file not found. Run 'rasa test nlu' first!")


if __name__ == '__main__':
    compare_test_results()


print("\n" + "="*80)
print("📦 SEMUA FILE TELAH DIGENERATE!")
print("="*80)
print("\n📁 STRUKTUR FILE:")
print("  actions/")
print("    └── data_collector.py     ← Custom actions untuk logging")
print("  scripts/")
print("    ├── analyze_user_data.py  ← Analisis data user")
print("    ├── user_testing_guide.py ← Generate test scenarios")
print("    ├── compare_results.py    ← Compare improvements")
print("    └── quick_improvement.sh  ← Automated pipeline")
print("\n🚀 NEXT STEPS:")
print("  1. Copy actions/data_collector.py ke folder actions/")
print("  2. Update domain.yml (tambahkan actions baru)")
print("  3. Generate test scenarios: python scripts/user_testing_guide.py")
print("  4. Collect real user data (test ke 10-20 orang)")
print("  5. Analyze: python scripts/analyze_user_data.py")
print("  6. Improve & re-train!")
print("="*80)