import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Utensils, Users, CalendarDays, DollarSign, FileText, Settings, LogOut, PlusCircle, Trash2, Edit,
} from 'lucide-react'; // Icônes pour la navigation

// Importez le composant CompteDeGestion.
// IMPORTANT : Assurez-vous que le fichier CompteDeGestion.tsx se trouve dans le même répertoire (src/)
// que ce fichier App.tsx. Si vous l'avez placé dans un sous-dossier (ex: 'src/components/'),
// vous devrez ajuster ce chemin en conséquence (ex: './components/CompteDeGestion.tsx').
import CompteDeGestion from './CompteDeGestion.tsx'; // Chemin corrigé pour le même répertoire

// Définition des types pour les restaurants
interface Restaurant {
  id: string;
  name: string;
  address?: string;
  city?: string;
  zip_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  siret?: string; // Ajout du champ SIRET
}

// Translations for the main App shell
const appTranslations = {
  fr: {
    appName: "RestoPilot",
    dashboard: "Tableau de Bord",
    restaurants: "Restaurants",
    personnel: "Personnel",
    planning: "Planning",
    paie: "Paie",
    documents: "Documents",
    settings: "Paramètres",
    logout: "Déconnexion",
    selectRestaurant: "Sélectionner un établissement",
    manageRestaurants: "Gérer les établissements",
    addRestaurant: "Ajouter un établissement",
    editRestaurant: "Modifier l'établissement",
    deleteRestaurant: "Supprimer l'établissement",
    restaurantName: "Nom de l'établissement",
    address: "Adresse",
    city: "Ville",
    zipCode: "Code Postal",
    country: "Pays",
    phone: "Téléphone",
    email: "Email",
    siret: "Numéro SIRET", // Nouvelle traduction
    lookupSiret: "Rechercher SIRET", // Nouvelle traduction
    siretLookupSuccess: "Informations SIRET récupérées !",
    siretLookupError: "Erreur lors de la recherche SIRET : ",
    save: "Sauvegarder",
    cancel: "Annuler",
    confirmDelete: "Êtes-vous sûr de vouloir supprimer cet établissement ? Cette action est irréversible.",
    addRestaurantTitle: "Ajouter un nouvel établissement",
    editRestaurantTitle: "Modifier l'établissement",
    noRestaurantSelected: "Veuillez sélectionner un restaurant dans le menu déroulant ou en créer un.",
    loadingRestaurants: "Chargement des établissements...",
    errorLoadingRestaurants: "Erreur lors du chargement des établissements : ",
    errorAddingRestaurant: "Erreur lors de l'ajout de l'établissement : ",
    errorUpdatingRestaurant: "Erreur lors de la mise à jour de l'établissement : ",
    errorDeletingRestaurant: "Erreur lors de la suppression de l'établissement : ",
    restaurantAdded: "Établissement ajouté avec succès !",
    restaurantUpdated: "Établissement mis à jour avec succès !",
    restaurantDeleted: "Établissement supprimé avec succès !",
  },
  en: {
    appName: "RestoPilot",
    dashboard: "Dashboard",
    restaurants: "Restaurants",
    personnel: "Personnel",
    planning: "Scheduling",
    paie: "Payroll",
    documents: "Documents",
    settings: "Settings",
    logout: "Logout",
    selectRestaurant: "Select an establishment",
    manageRestaurants: "Manage establishments",
    addRestaurant: "Add establishment",
    editRestaurant: "Edit establishment",
    deleteRestaurant: "Delete establishment",
    restaurantName: "Establishment Name",
    address: "Address",
    city: "City",
    zipCode: "Zip Code",
    country: "Country",
    phone: "Phone",
    email: "Email",
    siret: "SIRET Number", // New translation
    lookupSiret: "Lookup SIRET", // New translation
    siretLookupSuccess: "SIRET information retrieved!",
    siretLookupError: "Error during SIRET lookup: ",
    save: "Save",
    cancel: "Cancel",
    confirmDelete: "Are you sure you want to delete this establishment? This action is irreversible.",
    addRestaurantTitle: "Add New Establishment",
    editRestaurantTitle: "Edit Establishment",
    noRestaurantSelected: "Please select a restaurant from the dropdown or create a new one.",
    loadingRestaurants: "Loading establishments...",
    errorLoadingRestaurants: "Error loading establishments: ",
    errorAddingRestaurant: "Error adding establishment: ",
    errorUpdatingRestaurant: "Error updating establishment: ",
    errorDeletingRestaurant: "Error deleting establishment: ",
    restaurantAdded: "Establishment added successfully!",
    restaurantUpdated: "Establishment updated successfully!",
    restaurantDeleted: "Establishment deleted successfully!",
  },
};

function App() {
  const [language, setLanguage] = useState('fr');
  const t = appTranslations[language];

  const [activeModule, setActiveModule] = useState('dashboard'); // 'dashboard', 'restaurants', 'compte-gestion'
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null); // For edit/add modal
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [siretInput, setSiretInput] = useState<string>(''); // New state for SIRET input

  // Fetch restaurants
  const fetchRestaurants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/restaurants');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRestaurants(data);
      // If no restaurant is selected, select the first one if available
      if (!selectedRestaurantId && data.length > 0) {
        setSelectedRestaurantId(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError(`${t.errorLoadingRestaurants} ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRestaurantId, t.errorLoadingRestaurants]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // Handle restaurant selection from dropdown
  const handleRestaurantSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRestaurantId(e.target.value);
  };

  // Handle Add/Edit Restaurant
  const handleAddEditRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant || !currentRestaurant.name) {
      setNotification({ message: "Le nom de l'établissement est requis.", type: "error" });
      return;
    }

    try {
      let response;
      if (currentRestaurant.id) { // Edit existing
        response = await fetch(`http://localhost:3001/api/restaurants/${currentRestaurant.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentRestaurant),
        });
        if (!response.ok) throw new Error(t.errorUpdatingRestaurant);
        setNotification({ message: t.restaurantUpdated, type: 'success' });
      } else { // Add new
        response = await fetch('http://localhost:3001/api/restaurants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentRestaurant),
        });
        if (!response.ok) throw new Error(t.errorAddingRestaurant);
        setNotification({ message: t.restaurantAdded, type: 'success' });
      }
      setIsModalOpen(false);
      await fetchRestaurants(); // Re-fetch list to update UI
    } catch (err) {
      setNotification({ message: `${err instanceof Error ? err.message : String(err)}`, type: 'error' });
    }
  };

  // Handle Delete Restaurant
  const handleDeleteRestaurant = async (id: string) => {
    if (!window.confirm(t.confirmDelete)) return; // Use native confirm for simplicity

    try {
      const response = await fetch(`http://localhost:3001/api/restaurants/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(t.errorDeletingRestaurant);
      setNotification({ message: t.restaurantDeleted, type: 'success' });
      // If the deleted restaurant was selected, clear selection
      if (selectedRestaurantId === id) {
        setSelectedRestaurantId(null);
      }
      await fetchRestaurants(); // Re-fetch list
    } catch (err) {
      setNotification({ message: `${err instanceof Error ? err.message : String(err)}`, type: 'error' });
    }
  };

  // Handle SIRET lookup
  const handleSiretLookup = async () => {
    if (!siretInput) {
      setNotification({ message: "Veuillez entrer un numéro SIRET.", type: "error" });
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/siret-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siret: siretInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const companyData = await response.json();
      setNotification({ message: t.siretLookupSuccess, type: 'success' });

      // Update currentRestaurant with fetched data
      setCurrentRestaurant(prev => ({
        ...prev!, // Ensure prev is not null
        name: companyData.name || prev?.name || '',
        address: companyData.address || prev?.address || '',
        city: companyData.city || prev?.city || '',
        zip_code: companyData.zip_code || prev?.zip_code || '',
        country: companyData.country || prev?.country || '',
        phone: companyData.phone || prev?.phone || '',
        email: companyData.email || prev?.email || '',
        siret: siretInput, // Keep the entered SIRET
      }));

    } catch (err) {
      console.error('Error during SIRET lookup:', err);
      setNotification({ message: `${t.siretLookupError} ${err instanceof Error ? err.message : String(err)}`, type: 'error' });
    }
  };


  // Modal for Add/Edit Restaurant
  const RestaurantModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          {currentRestaurant?.id ? t.editRestaurantTitle : t.addRestaurantTitle}
        </h2>
        <form onSubmit={handleAddEditRestaurant} className="space-y-4">
          {/* SIRET Input Field */}
          <div>
            <label htmlFor="siret" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              {t.siret}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                id="siret"
                name="siret"
                value={siretInput} // Use siretInput state for this field
                onChange={(e) => {
                  setSiretInput(e.target.value);
                  setCurrentRestaurant({ ...currentRestaurant!, siret: e.target.value }); // Also update currentRestaurant's siret
                }}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
                placeholder="Ex: 12345678900000"
              />
              <button
                type="button"
                onClick={handleSiretLookup}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ease-in-out whitespace-nowrap"
              >
                {t.lookupSiret}
              </button>
            </div>
          </div>
          {/* End SIRET Input Field */}

          <div>
            <label htmlFor="name" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              {t.restaurantName} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={currentRestaurant?.name || ''}
              onChange={(e) => setCurrentRestaurant({ ...currentRestaurant!, name: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              {t.address}
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={currentRestaurant?.address || ''}
              onChange={(e) => setCurrentRestaurant({ ...currentRestaurant!, address: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              {t.city}
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={currentRestaurant?.city || ''}
              onChange={(e) => setCurrentRestaurant({ ...currentRestaurant!, city: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="zip_code" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              {t.zipCode}
            </label>
            <input
              type="text"
              id="zip_code"
              name="zip_code"
              value={currentRestaurant?.zip_code || ''}
              onChange={(e) => setCurrentRestaurant({ ...currentRestaurant!, zip_code: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              {t.country}
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={currentRestaurant?.country || ''}
              onChange={(e) => setCurrentRestaurant({ ...currentRestaurant!, country: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              {t.phone}
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={currentRestaurant?.phone || ''}
              onChange={(e) => setCurrentRestaurant({ ...currentRestaurant!, phone: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              {t.email}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={currentRestaurant?.email || ''}
              onChange={(e) => setCurrentRestaurant({ ...currentRestaurant!, email: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setSiretInput(''); // Clear SIRET input on modal close
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors duration-200 ease-in-out"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 ease-in-out"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );


  // Render content based on active module
  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Tableau de Bord Général</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Bienvenue sur le tableau de bord consolidé de RestoPilot. Ici, vous aurez une vue d'ensemble de la performance de tous vos établissements.
            </p>
            {/* Placeholder for consolidated KPIs, alerts etc. */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Aperçu Financier Global</h3>
                <p className="text-gray-600 dark:text-gray-400">CA Total: XX {t.currencySymbol}</p>
                <p className="text-gray-600 dark:text-gray-400">Marge Brute Moyenne: YY %</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Alertes & Notifications</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                  <li>Licence de restaurant "Le Gourmet" expire le 31/12/2025.</li>
                  <li>Stock de matières premières bas pour "La Brasserie".</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 'restaurants':
        return (
          <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
              {t.manageRestaurants}
            </h2>
            <button
              onClick={() => {
                setCurrentRestaurant({ id: '', name: '', siret: '', address: '', city: '', zip_code: '', country: '', phone: '', email: '' }); // Initialize siret
                setSiretInput(''); // Clear siret input for new restaurant
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ease-in-out mb-6"
            >
              <PlusCircle size={18} className="inline-block mr-2" /> {t.addRestaurant}
            </button>

            {isLoading ? (
              <p className="text-gray-600 dark:text-gray-400">{t.loadingRestaurants}</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : restaurants.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">Aucun établissement enregistré. Commencez par en ajouter un !</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.restaurantName}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.siret}
                      </th> {/* Display SIRET in table */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.address}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t.phone}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {restaurants.map((restaurant) => (
                      <tr key={restaurant.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {restaurant.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {restaurant.siret || 'N/A'}
                        </td> {/* Display SIRET */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {restaurant.address}, {restaurant.city}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {restaurant.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setCurrentRestaurant(restaurant);
                              setSiretInput(restaurant.siret || ''); // Set siretInput when editing
                              setIsModalOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                            title={t.editRestaurant}
                          >
                            <Edit size={18} className="inline-block" />
                          </button>
                          <button
                            onClick={() => handleDeleteRestaurant(restaurant.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title={t.deleteRestaurant}
                          >
                            <Trash2 size={18} className="inline-block" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {isModalOpen && <RestaurantModal />}
          </div>
        );
      case 'compte-gestion':
        if (!selectedRestaurantId) {
          return (
            <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                {t.noRestaurantSelected}
              </h2>
            </div>
          );
        }
        return <CompteDeGestion restaurantId={selectedRestaurantId} />;
      default:
        return null;
    }
  };

  const selectedRestaurant = restaurants.find(r => r.id === selectedRestaurantId);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 font-inter text-gray-900 dark:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 dark:bg-gray-900 text-white shadow-lg flex flex-col">
        <div className="p-6 text-2xl font-bold text-blue-400 border-b border-gray-700">
          {t.appName}
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <button
            onClick={() => setActiveModule('dashboard')}
            className={`flex items-center w-full px-4 py-2 rounded-md transition-colors duration-200 ease-in-out
              ${activeModule === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}
          >
            <LayoutDashboard size={20} className="mr-3" /> {t.dashboard}
          </button>
          <button
            onClick={() => setActiveModule('restaurants')}
            className={`flex items-center w-full px-4 py-2 rounded-md transition-colors duration-200 ease-in-out
              ${activeModule === 'restaurants' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}
          >
            <Utensils size={20} className="mr-3" /> {t.restaurants}
          </button>
          <button
            onClick={() => setActiveModule('compte-gestion')}
            className={`flex items-center w-full px-4 py-2 rounded-md transition-colors duration-200 ease-in-out
              ${activeModule === 'compte-gestion' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}
          >
            <DollarSign size={20} className="mr-3" /> Compte de Gestion
          </button>
          {/* Other menu items - placeholders for future modules */}
          <button
            onClick={() => setActiveModule('personnel')}
            className={`flex items-center w-full px-4 py-2 rounded-md transition-colors duration-200 ease-in-out
              ${activeModule === 'personnel' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}
          >
            <Users size={20} className="mr-3" /> {t.personnel}
          </button>
          <button
            onClick={() => setActiveModule('planning')}
            className={`flex items-center w-full px-4 py-2 rounded-md transition-colors duration-200 ease-in-out
              ${activeModule === 'planning' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}
          >
            <CalendarDays size={20} className="mr-3" /> {t.planning}
          </button>
          <button
            onClick={() => setActiveModule('paie')}
            className={`flex items-center w-full px-4 py-2 rounded-md transition-colors duration-200 ease-in-out
              ${activeModule === 'paie' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}
          >
            <DollarSign size={20} className="mr-3" /> {t.paie}
          </button>
          <button
            onClick={() => setActiveModule('documents')}
            className={`flex items-center w-full px-4 py-2 rounded-md transition-colors duration-200 ease-in-out
              ${activeModule === 'documents' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}
          >
            <FileText size={20} className="mr-3" /> {t.documents}
          </button>
          <button
            onClick={() => setActiveModule('settings')}
            className={`flex items-center w-full px-4 py-2 rounded-md transition-colors duration-200 ease-in-out
              ${activeModule === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-700 text-gray-300'}`}
          >
            <Settings size={20} className="mr-3" /> {t.settings}
          </button>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => alert(t.logout)} // Placeholder for logout functionality
            className="flex items-center w-full px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors duration-200 ease-in-out"
          >
            <LogOut size={20} className="mr-3" /> {t.logout}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
          <div className="flex items-center">
            {/* Restaurant Selector */}
            {activeModule !== 'restaurants' && ( // Hide selector on restaurant management page
              <div className="relative inline-block text-gray-700 dark:text-gray-300 mr-4">
                <select
                  value={selectedRestaurantId || ''}
                  onChange={handleRestaurantSelect}
                  className="block appearance-none w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white py-2 px-4 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">{t.selectRestaurant}</option>
                  {restaurants.map((restaurant) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z" />
                  </svg>
                </div>
              </div>
            )}
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {selectedRestaurant ? selectedRestaurant.name : t.appName}
              {selectedRestaurant && selectedRestaurant.address && (
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  ({selectedRestaurant.address}, {selectedRestaurant.city})
                </span>
              )}
            </h2>
          </div>
          {/* Language Toggle (from previous App.tsx) */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-3 py-1 rounded-md text-sm font-semibold ${language === 'fr' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-md text-sm font-semibold ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'}`}
            >
              EN
            </button>
          </div>
        </header>

        {/* Notifications area (global for the app) */}
        {notification && (
          <div className={`fixed top-4 right-4 p-3 rounded-md shadow-lg z-50
            ${notification.type === 'info' ? 'bg-blue-500 text-white' : ''}
            ${notification.type === 'success' ? 'bg-green-500 text-white' : ''}
            ${notification.type === 'error' ? 'bg-red-500 text-white' : ''}`}>
            {notification.message}
          </div>
        )}

        {/* Main content area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
