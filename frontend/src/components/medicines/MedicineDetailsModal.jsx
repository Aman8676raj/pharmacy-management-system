import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Layers, Package, Hash, User, Calendar, ExternalLink, Edit } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

export const MedicineDetailsModal = ({ medicine, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!medicine) return null;

  const canEdit = user?.role === 'admin' || user?.role === 'pharmacist' || user?.role === 'inventory_manager';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={medicine.name}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onClose();
              navigate(`/medicines/${medicine.id || medicine._id}`);
            }}
            rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
          >
            Open Full Details Page
          </Button>

          <div className="flex items-center gap-2">
            {canEdit && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit className="w-3.5 h-3.5" />}
                onClick={() => {
                  onClose();
                  navigate(`/medicines/${medicine.id || medicine._id}/edit`);
                }}
              >
                Edit
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Status badges header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-semibold text-xs">
              {medicine.sku}
            </span>
            <Badge variant={medicine.isActive ? 'success' : 'neutral'} size="sm" dot>
              {medicine.isActive ? 'Active' : 'Deactivated'}
            </Badge>
          </div>

          <div>
            {medicine.requiresPrescription ? (
              <span className="inline-flex items-center text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                Prescription Required (Rx)
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Over-the-Counter (OTC)
              </span>
            )}
          </div>
        </div>

        {/* 2-column details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* General Information */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-semibold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
              <Pill className="w-3.5 h-3.5 text-teal-600" />
              General Clinical Information
            </h4>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Generic Name</span>
              <span className="text-slate-700 font-medium">{medicine.genericName || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Brand / Trade Name</span>
              <span className="text-slate-700 font-medium">{medicine.brandName || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Category</span>
              <span className="text-slate-700 font-medium">{medicine.category}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Manufacturer</span>
              <span className="text-slate-700 font-medium">{medicine.manufacturer || '-'}</span>
            </div>
          </div>

          {/* Formulation & Packaging */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h4 className="font-semibold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
              <Package className="w-3.5 h-3.5 text-blue-600" />
              Dosage & Formulation
            </h4>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Dosage Form</span>
              <span className="text-slate-700 font-medium">{medicine.dosageForm}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Strength</span>
              <span className="text-slate-700 font-medium">{medicine.strength || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Unit & Presentation</span>
              <span className="text-slate-700 font-medium">
                {medicine.unit} {medicine.packSize ? `(${medicine.packSize})` : ''}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Min Reorder Threshold</span>
              <span className="text-slate-700 font-medium">{medicine.minimumStock} units</span>
            </div>
          </div>
        </div>

        {/* Composition & Description */}
        {medicine.composition && (
          <div className="p-3 rounded-lg border border-slate-200 bg-white">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-0.5">
              Composition
            </span>
            <p className="text-slate-700">{medicine.composition}</p>
          </div>
        )}

        {medicine.description && (
          <div className="p-3 rounded-lg border border-slate-200 bg-white">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold mb-0.5">
              Description & Clinical Indications
            </span>
            <p className="text-slate-700 leading-relaxed">{medicine.description}</p>
          </div>
        )}

        {/* Footer Meta */}
        <div className="pt-2 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
          <span>Created by: {medicine.createdBy?.name || 'Authorized Staff'}</span>
          <span>Created: {formatDate(medicine.createdAt)}</span>
        </div>
      </div>
    </Modal>
  );
};

export default MedicineDetailsModal;

