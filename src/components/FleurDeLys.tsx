import Svg, { Path, Rect } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

export function FleurDeLys({ size = 32, color = '#FFFFFF' }: Props) {
  return (
    <Svg width={size} height={size * 1.25} viewBox="0 0 100 125" fill={color}>
      <Path d="M50 4C44 4 29 18 27 36C25 50 33 60 42 64C45 65 47 66 49 66L49 72C44 70 39 71 34 75C27 80 25 86 28 90L50 84L72 90C75 86 73 80 66 75C61 71 56 70 51 72L51 66C53 66 55 65 58 64C67 60 75 50 73 36C71 18 56 4 50 4Z" />
      <Path d="M27 44C18 36 4 37 1 50C-1 58 5 67 15 69C23 71 32 66 35 59C29 55 26 50 27 44Z" />
      <Path d="M73 44C82 36 96 37 99 50C101 58 95 67 85 69C77 71 68 66 65 59C71 55 74 50 73 44Z" />
      <Rect x="36" y="82" width="28" height="7" rx="3" />
      <Rect x="45" y="89" width="10" height="18" rx="2" />
      <Rect x="30" y="105" width="40" height="7" rx="3.5" />
    </Svg>
  );
}
