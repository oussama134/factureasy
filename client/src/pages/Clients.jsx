import { useState, useEffect } from 'react';
import './Clients.css';
import { getClients, addClient, deleteClient, updateClient } from '../services/clientService';
import useNotification from '../hooks/useNotification';
import Notification from '../components/Notification';
import Modal from '../components/Modal';

function Clients() {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState({
    nom: '',
    email: '',
    entreprise: '',
    telephone: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  // Hook de notification
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const clientsData = await getClients();
      setClients(clientsData);
    } catch (err) {
      console.error("Erreur chargement clients :", err);
      showError('Erreur lors du chargement des clients');
    }
  };

  const handleChange = (e) => {
    setNewClient({ ...newClient, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateClient(editingId, newClient);
        showSuccess('Client modifié avec succès !');
      } else {
        await addClient(newClient);
        showSuccess('Client ajouté avec succès !');
      }

      await fetchClients();
      handleCloseModal();
    } catch (err) {
      console.error("Erreur ajout/modification client :", err);
      showError('Erreur lors de l\'enregistrement du client');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await deleteClient(id);
        showSuccess('Client supprimé avec succès !');
        setClients(clients.filter(client => client._id !== id));
      } catch (err) {
        console.error("Erreur suppression client :", err);
        showError('Erreur lors de la suppression du client');
      }
    }
  };

  const handleEdit = (client) => {
    setNewClient(client);
    setEditingId(client._id);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setNewClient({ nom: '', email: '', entreprise: '', telephone: '' });
    setEditingId(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setNewClient({ nom: '', email: '', entreprise: '', telephone: '' });
  };

  const filteredClients = clients.filter(client =>
    client.nom?.toLowerCase().includes(search.toLowerCase()) ||
    client.email?.toLowerCase().includes(search.toLowerCase()) ||
    client.entreprise?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="clients-container">
        <h2>👥 Gestion des Clients</h2>
        <button 
          className="add-btn" 
          onClick={handleAddNew}
        >
          ➕ Nouveau client
        </button>

        <div className="filters">
          <input
            type="text"
            placeholder="🔍 Rechercher un client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <table className="clients-table">
          <thead>
            <tr>
              <th>👤 Nom</th>
              <th>📧 Email</th>
              <th>🏢 Entreprise</th>
              <th>📞 Téléphone</th>
              <th>⚡ Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client._id}>
                <td>{client.nom}</td>
                <td>{client.email}</td>
                <td>{client.entreprise || '-'}</td>
                <td>{client.telephone || '-'}</td>
                <td>
                  <div className="actions-container">
                    <button 
                      className="action-btn edit" 
                      onClick={() => handleEdit(client)}
                      title="Modifier"
                    >
                      📝
                    </button>
                    <button 
                      className="action-btn delete" 
                      onClick={() => handleDelete(client._id)}
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
        title={editingId ? '📝 Modifier le Client' : '➕ Nouveau Client'}
      >
        <form className="client-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>👤 Nom Complet</label>
            <input 
              type='text' 
              name='nom' 
              placeholder='Nom et prénom' 
              value={newClient.nom} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-row">
            <label>📧 Email</label>
            <input 
              type='email' 
              name='email' 
              placeholder='email@exemple.com' 
              value={newClient.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-row">
            <label>🏢 Entreprise</label>
            <input 
              type='text' 
              name='entreprise' 
              placeholder="Nom de l'entreprise" 
              value={newClient.entreprise} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="form-row">
            <label>📞 Téléphone</label>
            <input 
              type='tel' 
              name='telephone' 
              placeholder='+33 6 12 34 56 78' 
              value={newClient.telephone} 
              onChange={handleChange} 
            />
          </div>
          
          <div className="form-actions">
            <button type='submit' className='btn-save'>
              💾 {editingId ? 'Modifier' : 'Ajouter'}
            </button>
            <button 
              type='button' 
              className='btn-cancel'
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

export default Clients;
