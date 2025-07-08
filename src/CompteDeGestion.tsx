import React from 'react';

interface CompteDeGestionProps {
  restaurantId: string;
}

const CompteDeGestion: React.FC<CompteDeGestionProps> = ({ restaurantId }) => {
  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Compte de Gestion</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Contenu du compte de gestion pour le restaurant sélectionné (ID: {restaurantId}).
      </p>
      <p className="text-gray-600 dark:text-gray-400">
        Ceci est un espace réservé. Vous pourrez ici visualiser et gérer les données financières spécifiques à cet établissement.
      </p>
      {/* Ajoutez ici les graphiques, tableaux et fonctionnalités spécifiques au compte de gestion */}
    </div>
  );
};

export default CompteDeGestion;
