import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { ja } from 'date-fns/locale';
import { format } from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";

const CustomDateInput = forwardRef(({ value, onClick }, ref) => (
  <div className="relative w-full">
    <div className="absolute inset-y-0 left-2 flex items-center cursor-pointer" onClick={onClick}>
      <img src="/calendar_2343659.png" alt="カレンダー" className="w-5 h-5 opacity-70" />
    </div>
    <input
      readOnly
      value={value}
      onClick={onClick}
      ref={ref}
      className="w-full pl-10 pr-10 rounded-md border-gray-300 shadow-sm focus:border-blue-400 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
      placeholder="日付を選択"
    />
  </div>
));

const DateField = ({ label, value, onChange }) => {
  return (
    <div>
      {label && <label className="block font-medium mb-1">{label}</label>}
      <DatePicker
        selected={value ? new Date(value) : null}
        onChange={(date) => onChange(date ? format(date, 'yyyy/MM/dd') : '')}
        dateFormat="yyyy/MM/dd"
        locale={ja}
        isClearable
        customInput={<CustomDateInput />}
      />
    </div>
  );
};

export default DateField;
