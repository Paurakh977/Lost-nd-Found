'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface ResolveCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: { outcome: string; notes?: string; assignType?: 'itemAssignedTo' | 'foundBy'; assignee?: { clerkId?: string; name: string; contactInfo?: string } }) => void;
}

export default function ResolveCaseModal({ isOpen, onClose, onConfirm }: ResolveCaseModalProps) {
  const [outcome, setOutcome] = useState('');
  const [notes, setNotes] = useState('');
  const [assignType, setAssignType] = useState<'itemAssignedTo' | 'foundBy' | ''>('');
  const [assigneeName, setAssigneeName] = useState('');
  const [assigneeClerkId, setAssigneeClerkId] = useState('');
  const [assigneeContact, setAssigneeContact] = useState('');

  const submit = () => {
    const payload: any = { outcome: outcome.trim(), notes: notes.trim() || undefined };
    if (assignType) {
      payload.assignType = assignType;
      payload.assignee = {
        name: assigneeName.trim(),
        clerkId: assigneeClerkId.trim() || undefined,
        contactInfo: assigneeContact.trim() || undefined,
      };
    }
    onConfirm(payload);
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 z-[10000] bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg bg-white rounded-xl border p-6">
              <h2 className="text-lg font-semibold mb-4">Resolve Case</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Outcome</label>
                  <input value={outcome} onChange={(e) => setOutcome(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Item returned to owner" />
                </div>
                <div>
                  <label className="text-sm font-medium">Notes (optional)</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 text-sm" rows={3} />
                </div>
                <div>
                  <label className="text-sm font-medium">Assign to (optional)</label>
                  <select value={assignType} onChange={(e) => setAssignType(e.target.value as any)} className="mt-1 w-full border rounded px-3 py-2 text-sm">
                    <option value="">Do not set</option>
                    <option value="itemAssignedTo">Item Assigned To</option>
                    <option value="foundBy">Found By</option>
                  </select>
                </div>
                {assignType && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <input value={assigneeName} onChange={(e) => setAssigneeName(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Clerk ID (optional)</label>
                      <input value={assigneeClerkId} onChange={(e) => setAssigneeClerkId(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Contact Info (optional)</label>
                      <input value={assigneeContact} onChange={(e) => setAssigneeContact(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button className="px-4 py-2 rounded border" onClick={onClose}>Cancel</button>
                <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={submit} disabled={!outcome.trim()}>Confirm Resolve</button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  if (typeof window !== 'undefined') return createPortal(content, document.body);
  return content;
}


