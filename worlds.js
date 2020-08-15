let worlds = {
	
	"vale_da_lua": {
		"display_name": "Vale da Lua",
		"level_range": [1, 5],
		"enemies": [
			{
				"display_name": "Coelho fofo",
				"attack": "(10*x)+15",
				"defense": 5,
				"critic": 0.05,
				"versatility": 5,
				"velocity": 5,
				"max_health": "70+x*7",
				"exp": "20 + 7*x",
				"coins": "2*x+5"
			},
			{
				"display_name": "Ratinho sujo",
				"attack": "(9*x)+18",
				"defense": 6,
				"critic": 0.05,
				"versatility": 5,
				"velocity": 5,
				"max_health": "60+x*8",
				"exp": "20 + 7*x",
				"coins": "2*x+5"

			},
			{
				"display_name": "Pombo",
				"attack": "(9*x)+20",
				"defense": 8,
				"critic": 0.07,
				"versatility": 5,
				"velocity": 7,
				"max_health": "80+x*7",
				"exp": "25 + 7*x",
				"coins": "2*x+8"
			}
		],
		"boss": {
			"display_name": "Lobo Alpha",
			"attack": "70 + x*20",
			"defense": 22,
			"critic": 0.1,
			"versatility": 15,
			"velocity": 10,
			"max_health": 350,
			"exp": "50+x*10",
			"coins": "5*x+20"
		}
		
		
	},
	"recanto_dos_geodos": {
		"display_name": "Recanto dos Geodos",
		"level_range": [6, 10],
		"enemies": [
			{
				"display_name": "Elemental enfraquecido",
				"attack": "(10*x)+15",
				"defense": 5,
				"critic": 0.05,
				"versatility": 5,
				"velocity": 5,
				"max_health": "70+x*7",
				"exp": "20 + 7*x",
				"coins": "2*x+5"
			},
			{
				"display_name": "Rochoso inerte",
				"attack": "(9*x)+18",
				"defense": 6,
				"critic": 0.05,
				"versatility": 5,
				"velocity": 5,
				"max_health": "60+x*8",
				"exp": "20 + 7*x",
				"coins": "2*x+5"

			},
			{
				"display_name": "Pedra",
				"attack": "(9*x)+20",
				"defense": 8,
				"critic": 0.07,
				"versatility": 5,
				"velocity": 7,
				"max_health": "80+x*7",
				"exp": "25 + 7*x",
				"coins": "2*x+8"
			}
		],
		"boss": {
			"display_name": "Manifestação Laval",
			"attack": "70 + x*20",
			"defense": 22,
			"critic": 0.1,
			"versatility": 15,
			"velocity": 10,
			"max_health": 350,
			"exp": "50+x*10",
			"coins": "5*x+20"
		}
	},
	/*
	"Santuário da Ilusão": {
		"Imagem confusa",
		"Espelho Quebrado",
		"Ser transparente"
		
		"Guardião da Ilusão" - boss
	},
	"Floresta Espectral": {
		"Espectro fantasmagórico"
		"Aparição menor"
		"Lobo"
		
		"Banshee das trevas" - boss
	},
	"Planalto Aquamarine": {
		"Aquático enravecido"
		"Peixe com pernas"
		"Filhote de tubarão"
		
		"Tubarão Voador" - boss
	},
	"Expresso dos Sonhos": {
		"Criatura Amórfaga"
		"Deformação Climática"
		"Energia trepidante"
		
		"A garota que te rejeitou na terceira série" - boss
	}*/
}

module.exports = worlds;