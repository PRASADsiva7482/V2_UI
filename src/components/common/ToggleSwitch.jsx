import { memo } from 'react';

/**
 * Reusable ToggleSwitch — extracted from Settings.jsx body (U-2).
 * Now defined at MODULE level so React.memo works and internal state persists.
 */
const ToggleSwitch = memo(function ToggleSwitch({ checked, onChange, label }) {
    return (
        <label className="settings-toggle" aria-label={label}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="settings-toggle-slider"></span>
        </label>
    );
});

export default ToggleSwitch;
