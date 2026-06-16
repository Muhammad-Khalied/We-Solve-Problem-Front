import { useState, useEffect, useRef } from 'react';
import { HiOutlineXMark } from 'react-icons/hi2';
import './MultiSelectDropdown.css';

const MultiSelectDropdown = ({ options, value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optValue) => {
    if (value.includes(optValue)) {
      onChange(value.filter(v => v !== optValue));
    } else {
      onChange([...value, optValue]);
    }
  };

  return (
    <div className={`custom-multi-select ${disabled ? 'disabled' : ''}`} ref={dropdownRef}>
      <div className="select-trigger" onClick={() => !disabled && setIsOpen(!isOpen)}>
        {value.length === 0 ? <span className="placeholder">Select options...</span> : (
          <div className="selected-tags">
            {value.map(v => {
              const opt = options.find(o => o.value === v);
              return (
                <span key={v} className="tag" onClick={(e) => { e.stopPropagation(); toggleOption(v); }}>
                  {opt?.label || v} <HiOutlineXMark />
                </span>
              )
            })}
          </div>
        )}
      </div>
      {isOpen && !disabled && (
        <div className="select-dropdown">
          {options.length === 0 ? <div className="no-options">No options</div> : options.map(opt => (
            <label key={opt.value} className="select-option">
              <input type="checkbox" checked={value.includes(opt.value)} onChange={() => toggleOption(opt.value)} />
              {opt.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
