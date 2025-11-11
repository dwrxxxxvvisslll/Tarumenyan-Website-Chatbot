"""
#!/bin/bash

echo "🚀 QUICK IMPROVEMENT PIPELINE"
echo "=============================="

echo ""
echo "Step 1: Analyze collected user data..."
python scripts/analyze_user_data.py

echo ""
echo "Step 2: Review suggested training data..."
echo "File: suggested_training_data.yml"
echo "Action: Review dan copy ke data/nlu.yml"
read -p "Press enter after you've reviewed and added the data..."

echo ""
echo "Step 3: Re-train model dengan data baru..."
rasa train --num-threads 4

echo ""
echo "Step 4: Test dengan cross-validation..."
rasa test nlu --nlu data/nlu.yml --cross-validation --folds 5

echo ""
echo "Step 5: Compare results..."
python scripts/compare_results.py

echo ""
echo "✅ IMPROVEMENT PIPELINE COMPLETE!"
echo "Check results/ folder untuk detailed metrics"
"""