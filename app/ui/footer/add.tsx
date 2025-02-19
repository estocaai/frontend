import { Plus } from 'iconoir-react';

export default function Add() {
  return (
    <div>
        <div className="flex items-center justify-center w-16 h-16 rounded-full absolute bottom-7 inset-0 m-auto bg-white"></div>
        <div className="flex items-center justify-center w-14 h-14 rounded-full absolute bottom-7 inset-0 m-auto bg-gradient-to-b from-azul1 to-azul3">
        <div className="flex flex-col items-center">
            <Plus className="text-white text-2xl" />
        </div>
        </div>
    </div>
  );
}
