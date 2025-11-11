def generate_test_scenarios():
    """Generate test scenarios untuk user testing"""
    
    scenarios = {
        "Scenario 1: First Time User (Casual)": [
            "hai",
            "aku mau prewedding di bali",
            "ada konsep apa aja?",
            "yang romantis",
            "harganya berapa?",
            "mahal ya",
            "udah dulu deh, makasih"
        ],
        
        "Scenario 2: Confused User (Butuh Bantuan)": [
            "halo",
            "aku bingung mau pilih tema",
            "kami beda agama sih, orangtua awalnya ga setuju",
            "tapi sekarang udah oke",
            "kira-kira tema apa yang cocok?",
            "oke menarik",
            "budget kami sekitar 8 juta",
            "gimana cara bookingnya?"
        ],
        
        "Scenario 3: LDR Couple Story": [
            "selamat siang",
            "mau konsultasi dong",
            "kami LDR 4 tahun Jakarta-Bali",
            "sempet mau putus tapi akhirnya bertahan",
            "sekarang mau nikah",
            "pengen foto prewedding yang ada makna gitu",
            "bantu pilihkan tema"
        ],
        
        "Scenario 4: Love at First Sight": [
            "hi",
            "kami cinta pada pandangan pertama",
            "ketemu di wedding temen langsung klik",
            "rasanya kayak udah kenal lama",
            "percaya sama takdir",
            "pengen konsep yang soft romantic",
            "info paket ya"
        ],
        
        "Scenario 5: Budget Conscious": [
            "halo kak",
            "mau tanya paket prewedding",
            "budget kami terbatas sih",
            "maksimal 5 juta",
            "bisa dapet apa aja?",
            "lokasinya dimana?",
            "oke noted thanks"
        ]
    }
    
    output = []
    output.append("="*60)
    output.append("🧪 USER TESTING SCENARIOS")
    output.append("="*60)
    output.append("\nBagikan scenarios ini ke 5-10 orang untuk testing:")
    output.append("Minta mereka chat dengan bot dan catat:")
    output.append("  1. Apakah bot mengerti pertanyaan mereka?")
    output.append("  2. Apakah response relevan?")
    output.append("  3. Apakah mereka puas dengan rekomendasinya?")
    output.append("="*60)
    
    for scenario_name, messages in scenarios.items():
        output.append(f"\n\n📋 {scenario_name}")
        output.append("-" * 60)
        for i, msg in enumerate(messages, 1):
            output.append(f"{i}. User: {msg}")
    
    output.append("\n\n" + "="*60)
    output.append("💡 TIPS:")
    output.append("  • Jangan kasih tahu intent yang 'benar'")
    output.append("  • Biarkan mereka chat natural")
    output.append("  • Catat semua kesalahan/confusion")
    output.append("  • Gunakan data ini untuk improve training!")
    output.append("="*60)
    
    # Save to file
    with open('user_testing_guide.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(output))
    
    print('\n'.join(output))
    print("\n✅ Saved to: user_testing_guide.txt")


if __name__ == '__main__':
    generate_test_scenarios()