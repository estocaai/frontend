'use client';

import { useState } from 'react';
import SelecaoCasas from '../selecaocasas/selecaoCasas';

export default function HeaderLista({ onCasaSelecionada }: { onCasaSelecionada: (novaCasa: string) => void }) {
    return (
        <div>
            <header className="pl-8 pr-8 pb-8 pt-8 flex flex-row w-screen items-center justify-between">
                <h1 className="text-3xl font-bold text-cinza1">Despensa</h1>
                <SelecaoCasas onCasaSelecionada={onCasaSelecionada} />
            </header>
        </div>
    );
}
