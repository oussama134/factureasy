import { useState, useEffect } from 'react';
import './Produits.css';
import { getProduits, addProduit, deleteProduit, updateProduit } from '../services/produitService';
import useNotification from '../hooks/useNotification';
import Notification from '../components/Notification';
import Modal from '../components/Modal';

function Produits() {
  const [produits, setProduits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProduit, setNewProduit] = useState({
    nom: '',
    prix: '',
    description: '',
    tva: '',
    categorie: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('');

  // Hook de notification
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    try {
      const produitsData = await getProduits();
      setProduits(produitsData);
    } catch (err) {
      console.error("Erreur chargement produit :", err);
      showError('Erreur lors du chargement des produits');
    }
  };

  const handleChange = (e) => {
    setNewProduit({ ...newProduit, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProduit(editingId, newProduit);
        showSuccess('Produit modifié avec succès !');
      } else {
        await addProduit(newProduit);
        showSuccess('Produit ajouté avec succès !');
      }
      await fetchProduits();
      handleCloseModal();
    } catch (err) {
      console.error("Erreur ajout/modification produit :", err);
      showError('Erreur lors de l\'enregistrement du produit');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await deleteProduit(id);
        showSuccess('Produit supprimé avec succès !');
        setProduits(produits.filter(produit => produit._id !== id));
      } catch (err) {
        console.error("Erreur suppression produit :", err);
        showError('Erreur lors de la suppression du produit');
      }
    }
  };

  const handleEdit = (produit) => {
    setNewProduit(produit);
    setEditingId(produit._id);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setNewProduit({ nom: '', prix: '', description: '', tva: '', categorie: '' });
    setEditingId(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setNewProduit({ nom: '', prix: '', description: '', tva: '', categorie: '' });
  };

  const filteredProduits = produits.filter(produit =>
    (produit.nom?.toLowerCase().includes(search.toLowerCase()) ||
     produit.description?.toLowerCase().includes(search.toLowerCase())) &&
    (!categorieFilter || produit.categorie === categorieFilter)
  );

  return (
    <>
      <div className="produits-container">
        <h2>📦 Gestion des Produits</h2>
        <button 
          className="add-btn" 
          onClick={handleAddNew}
        >
          ➕ Nouveau produit
        </button>

        <div className="filters">
          <input
            type="text"
            placeholder="🔍 Rechercher un produit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select 
            value={categorieFilter} 
            onChange={e => setCategorieFilter(e.target.value)}
          >
            <option value="">🏷️ Toutes catégories</option>
            <option value="patisserie">🍰 Pâtisserie</option>
            <option value="electronique">💻 Électronique</option>
            <option value="cafe">☕ Café</option>
          </select>
        </div>

        <table className="produits-table">
          <thead>
            <tr>
              <th>📦 Produit</th>
              <th>📝 Description</th>
              <th>💰 Prix</th>
              <th>📊 TVA</th>
              <th>🏷️ Catégorie</th>
              <th>⚡ Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProduits.map((produit) => (
              <tr key={produit._id}>
                <td>{produit.nom}</td>
                <td>{produit.description || '-'}</td>
                <td>{produit.prix} €</td>
                <td>{produit.tva || '0'} %</td>
                <td>
                  <span className={`categorie-badge categorie-${produit.categorie}`}>
                    {produit.categorie}
                  </span>
                </td>
                <td>
                  <div className="actions-container">
                    <button 
                      className="action-btn edit" 
                      onClick={() => handleEdit(produit)}
                      title="Modifier"
                    >
                      📝
                    </button>
                    <button 
                      className="action-btn delete" 
                      onClick={() => handleDelete(produit._id)}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal pour édition/ajout */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingId ? '📝 Modifier le Produit' : '➕ Nouveau Produit'}
      >
        <form className="produit-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>📦 Nom du Produit</label>
            <input 
              name="nom" 
              placeholder="Nom du produit" 
              value={newProduit.nom} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-row">
            <label>📝 Description</label>
            <input 
              name="description" 
              placeholder="Description du produit" 
              value={newProduit.description} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="form-row">
            <label>💰 Prix (€)</label>
            <input 
              type="number" 
              name="prix" 
              placeholder="0.00" 
              value={newProduit.prix} 
              onChange={handleChange} 
              required 
              step="0.01"
              min="0"
            />
          </div>
          
          <div className="form-row">
            <label>📊 TVA (%)</label>
            <input 
              type="number" 
              name="tva" 
              placeholder="20" 
              value={newProduit.tva} 
              onChange={handleChange} 
              min="0"
              max="100"
            />
          </div>
          
          <div className="form-row">
            <label>🏷️ Catégorie</label>
            <select 
              name="categorie" 
              value={newProduit.categorie} 
              onChange={handleChange} 
              required
            >
              <option value="">Choisir une catégorie</option>
              <option value="patisserie">🍰 Pâtisserie</option>
              <option value="electronique">💻 Électronique</option>
              <option value="cafe">☕ Café</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-save">
              💾 {editingId ? 'Modifier' : 'Ajouter'}
            </button>
            <button 
              type="button" 
              className="btn-cancel"
              onClick={handleCloseModal}
            >
              ❌ Annuler
            </button>
          </div>
        </form>
      </Modal>

      {/* Notification */}
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        duration={notification.duration}
      />
    </>
  );
}

export default Produits;
