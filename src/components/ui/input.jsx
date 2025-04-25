
function PositiveNumberInput({ value, onValueChange, ...props }) {
    const handleChange = (e) => {
        const inputValue = e.target.value;
        if (inputValue === "" || Number(inputValue) >= 0) {
        onValueChange(inputValue);
        }
    };

    return (
        <div className="flex flex-col items-start gap-2"> 
        <input
            id="pokemonQty"
            type="number"
            min="1"
            step="1"
            value={value}
            onChange={handleChange}
            {...props}
            className={`w-full px-4 py-1 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${props.className || ''}`}
        />
        </div>
    );
}

export { PositiveNumberInput };