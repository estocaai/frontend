'use client';

import { Plus} from 'iconoir-react';
import FormCasas from './formCasas';
import clsx from 'clsx';
import { useState } from 'react';

export default function HeaderCasas() {
    const [visbile, setVisible] = useState(false);

    return (
        <header className="p-8 flex flex-row w-screen items-center justify-between">
            <h1 className="text-3xl font-bold">Casas</h1>
            <Plus onClick={() => setVisible(true)} className='text-2xl'></Plus>
            <div className={clsx(
                'fixed w-screen h-screen top-0 left-0 p-8 bg-zinc-900 bg-opacity-30 z-50 flex items-center justify-center',
                {
                'fixed': visbile,
                'hidden': !visbile,
                },
            )}>
                <div className='opacity-100 w-full bg-white rounded-2xl p-5 flex flex-col gap-4'>
                    <FormCasas></FormCasas>
                    <button
                    onClick={() => setVisible(false)}
                    className="w-full border-solid border-2 border-azul1 text-azul1 font-semibold py-2 px-4 rounded-lg hover:bg-azul2 focus:outline-none focus:ring-2 focus:ring-azul2">
                    Cancelar
                    </button>
                </div>
            </div>
        </header>
    );
}
  