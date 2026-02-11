'use client';

import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            {/* Increased max-width from max-w-md to max-w-4xl (approx 2x width) */}
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl animate-fade-in-up transform transition-all">
                <div className="flex justify-between items-center p-8 border-b">
                    {/* Increased text size */}
                    <h3 className="text-3xl font-bold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none p-2 rounded-full hover:bg-gray-100"
                    >
                        {/* Increased icon size */}
                        <X className="h-8 w-8" />
                    </button>
                </div>
                {/* Increased padding */}
                <div className="p-8">
                    {children}
                </div>
                {footer && (
                    <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4 rounded-b-2xl">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
