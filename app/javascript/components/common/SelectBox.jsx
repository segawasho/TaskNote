import React, { useRef } from 'react';
import Select from 'react-select';

const SelectBox = ({ label, options, value, onChange, placeholder }) => {
  // セレクト外の自動スクロール用のref（div側に紐付け）
  const containerRef = useRef();

  // セレクトの選択肢リストを整形
  const selectOptions = [
    { value: '', label: placeholder },
    ...options.map((item) => ({
      value: item.id,
      label: item.name,
    })),
  ];

  // 現在の選択値に対応するオプション
  const selectedOption = selectOptions.find((o) => o.value === value) || null;

  // 値が変更された時
  const handleChange = (selected) => {
    onChange(selected?.value || '');
  };

  // セレクトが開かれた時にスクロール
  const handleMenuOpen = () => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    window.scrollBy(0, -80);
  };

  return (
    <div className="w-full" ref={containerRef}>
      <label className="block font-medium mb-1">{label}</label>
      <Select
        options={selectOptions}
        value={selectedOption}
        onChange={handleChange}
        placeholder={placeholder}
        isClearable={value !== ''}  // ✅ 初期時はクリアボタン非表示
        isSearchable={false}        // ✅ 自由入力は不可
        classNamePrefix="react-select"
        styles={{
          control: (provided) => ({
            ...provided,
            borderColor: '#D1D5DB',
            borderRadius: '0.375rem',
            minHeight: '40px',
          }),
          menu: (provided) => ({
            ...provided,
            zIndex: 50,  // モーダル内の重なり優先
            marginBottom: '60px',  // ✅ 下に余白つけてはみ出し防止
          }),
          placeholder: (provided) => ({
            ...provided,
            color: '#9CA3AF',  // ✅ プレースホルダーは薄グレー
          }),
        }}
        onMenuOpen={handleMenuOpen}
      />
    </div>
  );
};

export default SelectBox;
