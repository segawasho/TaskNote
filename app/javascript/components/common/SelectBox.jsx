import React, { useState, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

const SelectBox = ({ label, options, value, onChange, placeholder }) => {
  const selectedOption = options.find((o) => o.id === value) || null;

  return (
    <div className="w-full">
      <label className="block font-medium mb-1">{label}</label>
      <Listbox value={selectedOption} onChange={(val) => onChange(val?.id || '')}>
        <div className="relative">
          <Listbox.Button className="relative w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm">
            <span className="block truncate">
              {selectedOption ? selectedOption.name : placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
            </span>
          </Listbox.Button>

          <Transition
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              <Listbox.Option
                value={null}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  }`
                }
              >
                {placeholder}
              </Listbox.Option>

              {options.map((item) => (
                <Listbox.Option
                  key={item.id}
                  value={item}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    }`
                  }
                >
                  <span className="block truncate">{item.name}</span>
                  {value === item.id && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                      <CheckIcon className="h-5 w-5" />
                    </span>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default SelectBox;
