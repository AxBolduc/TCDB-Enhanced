import { COLORS } from '../../core/colors';

export function renderMedianPrice(span: HTMLSpanElement, price: string | null): void {
  span.textContent = ` Med: ${price || 'n/a'}`;
  span.title = price ? `Median price: ${price}` : 'Median price not found';
  span.style.color = price ? COLORS.success : COLORS.muted;
  span.style.fontWeight = price ? 'bold' : 'normal';
}
