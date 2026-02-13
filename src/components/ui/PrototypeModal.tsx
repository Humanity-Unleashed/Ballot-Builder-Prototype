'use client';

import React from 'react';
import { Construction } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

interface PrototypeModalProps {
  open: boolean;
  onClose: () => void;
  featureName: string;
}

export default function PrototypeModal({ open, onClose, featureName }: PrototypeModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
          <Construction className="h-7 w-7 text-amber-500" />
        </div>

        <h3 className="mb-1.5 text-lg font-bold text-gray-900">Coming Soon</h3>

        <p className="mb-5 text-sm leading-relaxed text-gray-500">
          <strong className="font-semibold text-gray-700">{featureName}</strong> isn&apos;t
          available yet in the prototype. We&apos;re working on it!
        </p>

        <Button title="Got it" onClick={onClose} />
      </div>
    </Modal>
  );
}
