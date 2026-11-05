import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { Spinner } from "../Spinner";

const Container = styled.div`
  width: 100%;
  overflow-y: auto;
`;

const ItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 12px 0;
`;

export const ScrollPaginator = ({
  initialItems = [],
  renderItem,
  onPaginate,
  onClickItem,
  getItemKey,
  hasMore: hasMoreProp = true,
  thresholdPx = 150,
  height = "420px",
  spinnerSize = 34,
  className,
  onItemsChange,
}) => {
  const containerRef = useRef(null);
  const sentinelRef = useRef(null);
  const paginatingRef = useRef(false);

  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(hasMoreProp);

  useEffect(() => {
    setItems(initialItems);
    // Remove setPage(1) to prevent resetting pagination state when parent accumulates items
  }, [initialItems]);

  useEffect(() => {
    setHasMore(hasMoreProp);
  }, [hasMoreProp]);

  const onItemsChangeRef = useRef(onItemsChange);
  useEffect(() => {
    onItemsChangeRef.current = onItemsChange;
  }, [onItemsChange]);

  useEffect(() => {
    onItemsChangeRef.current?.(items);
  }, [items]);

  const resolvedGetItemKey = useMemo(() => {
    if (getItemKey) return getItemKey;
    return (item, index) => item?.id ?? index;
  }, [getItemKey]);

  const loadNextPage = async () => {
    if (paginatingRef.current) return;
    if (loading) return;
    if (!hasMore) return;

    paginatingRef.current = true;
    setLoading(true);

    try {
      const nextPage = page + 1;
      const result = await onPaginate?.({
        page: nextPage,
        items,
      });

      const nextItems = Array.isArray(result) ? result : result?.items;
      const nextHasMore =
        Array.isArray(result) || result?.hasMore === undefined
          ? hasMore
          : !!result.hasMore;

      if (Array.isArray(nextItems) && nextItems.length > 0) {
        setItems((prev) => [...prev, ...nextItems]);
        setPage(nextPage);
        if (!Array.isArray(result) && result?.hasMore !== undefined) {
          setHasMore(nextHasMore);
        }
      } else if (Array.isArray(result)) {
        setHasMore(false);
      } else {
        setHasMore(nextHasMore);
      }
    } finally {
      paginatingRef.current = false;
      setLoading(false);
    }
  };

  const loadNextPageRef = useRef(loadNextPage);
  useEffect(() => {
    loadNextPageRef.current = loadNextPage;
  });

  useEffect(() => {
    const root = containerRef.current;
    const target = sentinelRef.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        loadNextPageRef.current();
      },
      {
        root,
        rootMargin: `0px 0px ${thresholdPx}px 0px`,
        threshold: 0,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [thresholdPx]);

  return (
    <Container ref={containerRef} style={{ height }} className={className}>
      <ItemsContainer>
        {items.map((item, index) => (
          <div
            key={resolvedGetItemKey(item, index)}
            onClick={() => onClickItem?.(item, index)}
          >
            {renderItem(item, index)}
          </div>
        ))}
        <div ref={sentinelRef} />
        {loading && (
          <LoaderContainer>
            <Spinner size={spinnerSize} />
          </LoaderContainer>
        )}
      </ItemsContainer>
    </Container>
  );
};

ScrollPaginator.propTypes = {
  initialItems: PropTypes.array,
  renderItem: PropTypes.func.isRequired,
  onPaginate: PropTypes.func.isRequired,
  onClickItem: PropTypes.func,
  getItemKey: PropTypes.func,
  hasMore: PropTypes.bool,
  thresholdPx: PropTypes.number,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  onItemsChange: PropTypes.func,
  spinnerSize: PropTypes.number,
};
