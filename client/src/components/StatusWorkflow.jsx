import { useState } from 'react';
import { updateFacture } from '../services/factureService';
import useNotification from '../hooks/useNotification';
import './StatusWorkflow.css';

function StatusWorkflow({ facture, onStatusChange }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { showSuccess, showError, showWarning } = useNotification();

  const getStatusInfo = (statut) => {
    switch (statut) {
      case 'brouillon':
        return {
          label: '📝 Brouillon',
          color: '#ffc107',
          nextStatus: 'envoye',
          nextLabel: '📤 Envoyer',
          description: 'Facture en cours de préparation'
        };
      case 'envoye':
        return {
          label: '📤 Envoyée',
          color: '#17a2b8',
          nextStatus: 'payee',
          nextLabel: '✅ Marquer comme payée',
          description: 'Facture envoyée au client'
        };
      case 'payee':
        return {
          label: '✅ Payée',
          color: '#28a745',
          nextStatus: null,
          nextLabel: null,
          description: 'Facture payée'
        };
      default:
        return {
          label: '❓ Inconnu',
          color: '#6c757d',
          nextStatus: null,
          nextLabel: null,
          description: 'Statut non défini'
        };
    }
  };

  const currentStatus = getStatusInfo(facture.statut);

  const handleStatusChange = async (newStatus) => {
    if (!currentStatus.nextStatus || currentStatus.nextStatus !== newStatus) {
      showWarning('Transition de statut non autorisée');
      return;
    }

    setIsUpdating(true);

    try {
      await updateFacture(facture._id, { statut: newStatus });
      
      const newStatusInfo = getStatusInfo(newStatus);
      showSuccess(`Facture ${newStatusInfo.label.toLowerCase()}`);
      
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
    } catch (error) {
      console.error('Erreur changement statut:', error);
      showError('Erreur lors du changement de statut');
    } finally {
      setIsUpdating(false);
    }
  };

  const getWorkflowSteps = () => {
    const steps = [
      { status: 'brouillon', label: '📝 Brouillon', completed: true },
      { status: 'envoye', label: '📤 Envoyée', completed: facture.statut === 'envoye' || facture.statut === 'payee' },
      { status: 'payee', label: '✅ Payée', completed: facture.statut === 'payee' }
    ];

    return steps;
  };

  return (
    <div className="status-workflow">
      <div className="workflow-header">
        <h4>📊 Workflow de Statut</h4>
        <div className="current-status">
          <span 
            className="status-badge" 
            style={{ backgroundColor: currentStatus.color }}
          >
            {currentStatus.label}
          </span>
        </div>
      </div>

      <div className="workflow-steps">
        {getWorkflowSteps().map((step, index) => (
          <div key={step.status} className={`workflow-step ${step.completed ? 'completed' : ''}`}>
            <div className="step-indicator">
              <div className={`step-circle ${step.completed ? 'completed' : ''}`}>
                {step.completed ? '✓' : (index + 1)}
              </div>
              {index < getWorkflowSteps().length - 1 && (
                <div className={`step-line ${step.completed ? 'completed' : ''}`}></div>
              )}
            </div>
            <div className="step-content">
              <span className="step-label">{step.label}</span>
              {step.status === facture.statut && (
                <span className="step-description">{currentStatus.description}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {currentStatus.nextStatus && (
        <div className="workflow-actions">
          <button
            className={`workflow-btn ${isUpdating ? 'loading' : ''}`}
            onClick={() => handleStatusChange(currentStatus.nextStatus)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <span className="spinner"></span>
                Mise à jour...
              </>
            ) : (
              <>
                {currentStatus.nextLabel}
                <span className="arrow">→</span>
              </>
            )}
          </button>
        </div>
      )}

      {facture.statut === 'payee' && (
        <div className="workflow-complete">
          <div className="complete-icon">🎉</div>
          <p>Facture complètement traitée !</p>
        </div>
      )}
    </div>
  );
}

export default StatusWorkflow; 