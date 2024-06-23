import { useState } from "react";
import Select, { GroupBase, Props, components } from "react-select";

const Menu = (props) => {
  return (
    <components.Menu {...props}>
      {props.children}
      {props.selectProps.haveSelectAll && (
        <button
          className="w-full flex justify-center px-2 py-1 cursor-pointer border-t-2 border-gray-200 hover:text-gray-500"
          onClick={() => {
            // Select all options
            props.selectProps.setValues(props.selectProps.options);
            props.selectProps.setMenuOpen(false);
          }}
        >
          Select all
        </button>
      )}
    </components.Menu>
  );
};

const MultiValue = ({ index, getValue, ...props }) => {
  const maxToShow = 1;
  const length = getValue().length;

  return length <= maxToShow ? (
    <components.MultiValue {...props} />
  ) : index < 1 ? (
    <div className="text-gray-500">
      {props.selectProps.placeholder} ({props.selectProps.value.length})
    </div>
  ) : null;
};

export default function CustomSelect<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: Props<Option, IsMulti, Group>) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Select
      {...props}
      setMenuOpen={setMenuOpen}
      menuIsOpen={menuOpen}
      //   menuIsOpen={true}
      onBlur={() => {
        setMenuOpen(false);
      }}
      onMenuOpen={() => {
        setMenuOpen(true);
      }}
      onMenuClose={() => {
        setMenuOpen(false);
      }}
      components={{
        Menu,
        LoadingIndicator: () => null,
        MultiValue,
      }}
    />
  );
}
