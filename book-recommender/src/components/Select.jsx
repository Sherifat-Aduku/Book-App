export default function SelectField(props) {
  const { placeholder, id, options, value, onSelect } = props

  return (<section className="select-wrapper" role="dropdown">
    <select defaultValue={value} onChange={(e) => onSelect(e.target.value)} list={id} id={id}>
      <option value=""> {placeholder}</option>
      {
        options.map((val) => <option key={val} 
        >
        {val}
        </option>)
      }
    </select>
  </section>)
}