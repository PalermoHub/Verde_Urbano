// ===== FUNZIONI DI CALCOLO AMBIENTALE =====
/**
 * Calcola l'O2 prodotto in kg/anno basato su altezza e specie
 * Media europea: 11-15 kg O2/anno per albero maturo
 * Alberi giovani/piccoli: 5-8 kg O2/anno
 */
function calculateO2Production(tree) {
    let baseO2 = 10; // kg/anno base

    // Fattore altezza (alberi più alti producono più O2)
    if (tree.altezza) {
        const heightFactor = Math.min(1.5, tree.altezza / 10);
        baseO2 *= heightFactor;
    }

    // Fattore specie (alcuni alberi sono più efficienti)
    const speciesMultiplier = {
        'Platanus orientalis': 1.4,
        'Magnolia grandiflora': 1.3,
        'Tilia tomentosa': 1.35,
        'Liquidambar styraciflua': 1.3,
        'Fraxinus ornus': 1.25,
        'Albizia julibrissin': 1.2,
        'Cupressus sempervirens': 1.15,
        'Phoenix canariensis': 1.1,
        'Quercus robur': 1.3,
        'Prunus cerasifera': 1.0
    };

    const multiplier = speciesMultiplier[tree.specie] || 1.0;
    return (baseO2 * multiplier).toFixed(2);
}

/**
 * Calcola la CO2 assorbita in kg/anno basato su altezza e specie
 * Media europea: 20-30 kg CO2/anno per albero maturo
 * Alberi giovani/piccoli: 10-15 kg CO2/anno
 */
function calculateCO2Absorption(tree) {
    let baseCO2 = 20; // kg/anno base

    // Fattore altezza
    if (tree.altezza) {
        const heightFactor = Math.min(1.8, tree.altezza / 8);
        baseCO2 *= heightFactor;
    }

    // Fattore diametro (alberi più grandi assorbono più CO2)
    if (tree.diametro) {
        const diameterFactor = Math.min(1.6, tree.diametro / 20);
        baseCO2 *= diameterFactor;
    }

    // Fattore specie
    const speciesMultiplier = {
        'Platanus orientalis': 1.5,
        'Magnolia grandiflora': 1.4,
        'Tilia tomentosa': 1.45,
        'Liquidambar styraciflua': 1.4,
        'Fraxinus ornus': 1.35,
        'Albizia julibrissin': 1.25,
        'Cupressus sempervirens': 1.2,
        'Phoenix canariensis': 1.15,
        'Quercus robur': 1.4,
        'Prunus cerasifera': 1.1
    };

    const multiplier = speciesMultiplier[tree.specie] || 1.0;
    return (baseCO2 * multiplier).toFixed(2);
}

/**
 * Calcola il costo di lavorazione per un albero
 */
function getWorkingCost(tree) {
    return tree.prezzo || 0;
}
