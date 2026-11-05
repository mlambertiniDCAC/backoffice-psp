import PropTypes from "prop-types";
import styled from "styled-components";

const List = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[150]};
`;

const Tab = styled.button`
  padding: 10px 16px;
  border: 0;
  border-bottom: 2px solid
    ${({ $active, theme }) => ($active ? theme.colors.blue[500] : "transparent")};
  background: transparent;
  color: ${({ $active, theme }) => ($active ? theme.colors.blue[500] : theme.colors.neutral[600])};
  font-weight: 600;
  cursor: pointer;
`;

const Tabs = ({ tabs, activeId, onChange }) => (
  <List role="tablist">
    {tabs.map((tab) => (
      <Tab
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={tab.id === activeId}
        $active={tab.id === activeId}
        onClick={() => onChange(tab.id)}
      >
        {tab.count === undefined ? tab.label : `${tab.label} (${tab.count})`}
      </Tab>
    ))}
  </List>
);

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      count: PropTypes.number,
    })
  ).isRequired,
  activeId: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Tabs;
