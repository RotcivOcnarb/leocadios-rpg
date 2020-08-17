function bh(level){ //Base Health
	return Math.floor(100 * Math.pow(1.1, level-1));
}

function ba(level){ //Base Attack
	return Math.floor(50 * Math.pow(1.1, level-1));
}

function bd(level){ //Base Defense
	return Math.floor(10 * Math.pow(1.1, level-1));
}

function ea(level){ //Equip Attack
	return (level-1) * 10 * slot_weights[0].reduce((t, n) => t+n)/2;
}

function eh(level){ //Equip Health
	return (level-1) * 10 * slot_weights[1].reduce((t, n) => t+n)/2;
}

function ed(level){ //Equip Defense
	return (level-1) * 10 * slot_weights[2].reduce((t, n) => t+n)/2;
}

function sc(level){ //Slap Count
	return level*0.2 + 1;
}

function es(level){ //Equip Speed
	return (level-1) * 10 * slot_weights[3].reduce((t, n) => t+n)/2;
}

function xp(level){ //Kills to level up
	return 2 * Math.pow(1.12, level-1);
}

function bx(level){ //Base EXP
	return Math.floor(50 * Math.pow(1.2, level-1));
}


let slot_weights = [
	[1, 0, 2, 0, 3], //Atk
	[1, 3, 0, 0, 0], // Health
	[1, 1.5, 0, 1, 0], //Def
	[1, 0, 1, 3, 0] // Speed
]

let worlds = {
	
	/*
	
	"capacete_de_barro" -
	"capuz_de_couro" x
	"colete_esfarrapado"
	"colete_de_couro"-
	"calcas_esfarrapadas"
	"calca_marrom"x
	"botinhas_podres" -
	"pisantes_de_couro"
	"espada_de_madeira"x
	"sabre_de_madeira" -
	"montante_de_madeira"
	
	*/
	
	"attack": function(x, boss){
		return Math.floor((((bh(x-1)+eh(x-1))/2)/sc(x-1) + (bd(x-1)+ed(x-1))/2)*0.7) * (boss? 2 : 1);
	},
	"defense": function(x, boss){
		return Math.floor(5 * Math.pow(1.3, x-1)) * (boss? 2 : 1);
	},
	"critic": function(x, boss){
		return 0.05 * (boss? 2 : 1);
	},
	"versatility": function(x, boss){
		return Math.floor((((bh(x)+eh(x))/2)/sc(x) + (bd(x)+ed(x))/2) * 0.1) * (boss? 2 : 1);
	},
	"velocity": function(x, boss){
		return ed(x) + es(x) - 3;
	},
	"max_health": function(x, boss){
		return Math.floor(sc(x)*(ba(x)+ea(x) - Math.floor(5 * Math.pow(1.3, x-1))/2) * 0.8) * (boss? 2 : 1);
	},
	"exp": function(x, boss){
		return Math.floor(bx(x)/xp(x) * 0.1) * (boss? 3 : 1);
	},
	"coins": function(x, boss){
		return (2*x+5) * (boss? 3 : 1);
	},
	
	
	"vale_da_lua": {
		"display_name": "Vale da Lua",
		"level_range": [1, 5],
		"drop_rate": 0.1,
		"drop":{
			"1": [
				"touquinha_legal",
				"camisa_verde",
				"calca_azul",
				"pano_para_os_pes",
				"pocao_pequena",
				"espada_comum",
				"espada_curta",
				"espada_fraca"
			],
			"2": [
				"capacete_de_barro",
				"colete_esfarrapado",
				"calcas_esfarrapadas",
				"botinhas_podres",
				"pocao_pequena",
				"espada_firme",
				"espada_basica",
				"espada_rustica"
			],
			"3": [
				"capacete_de_barro",
				"colete_esfarrapado",
				"calcas_esfarrapadas",
				"botinhas_podres",
				"pocao_pequena",
				"espada_firme",
				"espada_basica",
				"espada_rustica"
			],
			"4": [
				"pisantes_de_couro",
				"calca_marrom",
				"colete_de_couro",
				"capuz_de_couro",
				"pocao_pequena",
				"curta_de_ouro",
				"pequena_bronze",
				"firme_enferrujada"
			],
			"5": [
				"capacete_enferrujado",
				"peitoral_enferrujado",
				"coxotes_enferrujados",
				"pisantes_macios",
				"pocao_pequena",
				"espada_pequena",
				"firme_de_bronze"
			],
			"boss": [
				"botas_de_guarda",
				"calcas_de_guarda",
				"peitoral_de_guarda",
				"capacete_de_guarda",
				"pocao_pequena",
				"espada_curvada",
				"espada_fina",
				"espada_guerreiro"
			]
		},
		"enemies": [
			"Coelho fofo",
			"Ratinho sujo",
			"Pombo",
		],
		"boss": "Lobo Alpha",
		
	},

	"recanto_dos_geodos": {
		"display_name": "Recanto dos Geodos",
		"level_range": [6, 10],
		"drop_rate": 0.1,
		"drop":{
			"6": [
				"capacete_da_noite",
				"peitoral_da_noite",
				"calcas_da_noite",
				"botas_da_noite",
				"rustica_brilhosa",
				"espada_pesada",
				"comum_bronze"
			],
			"7": [
				"capacete_da_furia_ardente",
				"peitoral_da_furia_ardente",
				"coxotes_da_furia_ardente",
				"botas_da_furia_ardente",
				"lamina_dourada",
				"curta_de_latao",
				"pesada_ouro"
			],
			"8": [
				"capacete_da_furia_ardente",
				"peitoral_da_furia_ardente",
				"coxotes_da_furia_ardente",
				"botas_da_furia_ardente",
				"lamina_dourada",
				"curta_de_latao",
				"pesada_ouro"
			],
			"9": [
				"capacete_da_forca",
				"peitoral_da_forca",
				"calcas_da_forca",
				"pisantes_da_forca",
				"espada_enfraquecida",
				"curta_de_prata",
				"firme_de_ferro"
			],
			"10": [
				"capacete_elemental",
				"peitoral_elemental",
				"coxotes_elementais",
				"pisantes_elementais",
				"comum_pepita",
				"espada_lanca"
			],
			"boss": [
				"capacete_da_meditação",
				"colete_da_meditacao",
				"calcas_da_meditacao",
				"botas_da_meditação",
				"espada_chamas",
				"firme_brilhante"
			]
		},
		"enemies": [
			"Elemental enfraquecido",
			"Rochoso inerte",
			"Pedra"
		],
		"boss":  "Manifestação Laval"
	},
	
	"santuario_da_ilusao": {
		"display_name": "Santuário da Ilusão",
		"level_range": [11, 15],
		"drop_rate": 0.1,
		"enemies": [
			"Imagem confusa",
			"Espelho Quebrado",
			"Ser transparente"
		],
		"boss": "Guardião da Ilusão"
	},
	/*
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