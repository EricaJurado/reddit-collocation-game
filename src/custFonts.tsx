import { Devvit } from '@devvit/public-api';

// Glyphs are defined below
type SupportedGlyphs = keyof typeof Glyphs;

type Glyph = {
  path: string;
  width: number;
  height: number;
};

interface PressStart2PFontProps {
  children: string;
  size?: number;
  color?: string;
}

export function PressStart2PFont(props: PressStart2PFontProps): JSX.Element {
  const { children, size = 2, color = 'black' } = props;
  const line = children[0].split('');
  const gap = 1;
  const height = Glyphs['A'].height;
  let width = 0;
  let xOffset = 0;

  const characters: string[] = [];

  line.forEach((character) => {
    if (character === ' ') {
      xOffset += 6 + gap;
      return;
    }

    const glyph: Glyph = Glyphs[character as SupportedGlyphs];
    if (!glyph) {
      return;
    }
    characters.push(`<path
      d="${glyph.path}"
      transform="translate(${xOffset} 0)"
      fill-rule="evenodd"
      clip-rule="evenodd"
    />`);

    xOffset += glyph.width + gap;
    width = xOffset;
  });

  // Remove the trailing gap
  width -= gap;

  const scaledHeight: Devvit.Blocks.SizeString = `${height * size}px`;
  const scaledWidth: Devvit.Blocks.SizeString = `${width * size}px`;

  return (
    <image
      imageHeight={height}
      imageWidth={width}
      height={scaledHeight}
      width={scaledWidth}
      description={children[0]}
      resizeMode="fill"
      url={`data:image/svg+xml;charset=UTF-8,
        <svg
            width="${width}"
            height="${height}"
            viewBox="0 0 ${width} ${height}"
            fill="${color}"
            xmlns="http://www.w3.org/2000/svg"
        >
        ${characters.join('')}
        </svg>
      `}
    />
  );
}

const Glyphs = {
  ' ': {
    'path': '',
    'width': 6,
    'height': 7,
  },
  'A': {
    'path':
      'M0 125v625h125v125h125v125h375v125h125v125h125v625h250v250h375v250h250zM250 500h375v250h125v125h125v125h125v250z',
    'width': 6,
    'height': 7,
  },
  'B': {
    'path':
      'M0 125v875h750v125h125v250h125v125h125v250h125v125h750zM250 625h375v250h375v250zM250 250h375v250h375v250z',
    'width': 6,
    'height': 7,
  },
  'C': {
    'path':
      'M250 125v125h125v125h125v375h125v125h125v125h500v125h125v125h250v125h250v125h125v375h125v125h250v125h250v125h125v125h500z',
    'width': 6,
    'height': 7,
  },
  'D': {
    'path':
      'M0 125v875h625v125h125v125h125v375h125v125h125v125h625zM250 250h250v125h125v375h125v125h250v625z',
    'width': 6,
    'height': 7,
  },
  'E': {
    'path': 'M0 125v875h875v125h625v250h500v125h500v250h625v125h875z',
    'width': 6,
    'height': 7,
  },
  'F': {
    'path': 'M0 125v875h875v125h625v250h500v125h500v375h250z',
    'width': 6,
    'height': 7,
  },
  'G': {
    'path':
      'M250 125v125h125v125h125v375h125v125h125v125h625v125h500v125h125v375h125v125h250v250h125v125h375v500h625z',
    'width': 6,
    'height': 7,
  },
  'H': {
    'path': 'M0 125v875h250v375h375v375h250v875h250v375h375v375h250z',
    'width': 6,
    'height': 7,
  },
  'I': {
    'path': 'M125 125v125h250v625h250v125h750v125h250v625h250v125h750z',
    'width': 6,
    'height': 7,
  },
  'J': {
    'path': 'M125 125v125h125v125h250v125h375v750h250v750h125v125h625z',
    'width': 6,
    'height': 7,
  },
  'K': {
    'path':
      'M0 125v875h250v375h125v125h125v125h125v125h250v125h125v125h125v125h125v125h125v125h125v125h125v125h375v125h125v125h125v250h250z',
    'width': 6,
    'height': 7,
  },
  'L': {
    'path': 'M125 125v875h250v750h500v125h750z',
    'width': 6,
    'height': 7,
  },
  'M': {
    'path':
      'M0 125v875h250v125h125v125h125v125h125v125h250v875h250v500h125v250h125v250h125v500h250z',
    'width': 6,
    'height': 7,
  },
  'N': {
    'path':
      'M0 125v875h250v125h125v125h125v125h125v375h250v875h250v250h125v125h125v125h125v500h250z',
    'width': 6,
    'height': 7,
  },
  'O': {
    'path': 'M125 125v125h125v625h125v125h625v125h125v625h125v125h625zM250 250h375v625h375v625z',
    'width': 6,
    'height': 7,
  },
  'P': {
    'path': 'M0 125v875h750v125h125v375h125v125h500v250h250zM250 500h375v375h375v375z',
    'width': 6,
    'height': 7,
  },
  'Thorn': {
    'path': 'M0 125v875h250v125h500v125h125v375h125v125h500v125h250zM250 375h375v375h375v375z',
    'width': 6,
    'height': 7,
  },
  'Q': {
    'path':
      'M875 875v500h125v125h125v125h500v125h125v625h125v125h625v125h125zM625 875h375v625h250v125h125v125h250v375zM750 125v125h125v125h125z',
    'width': 6,
    'height': 7,
  },
  'R': {
    'path':
      'M0 125v875h750v125h125v375h250v125h125v125h125v125h375v125h125v125h125v250h250zM250 500h250v125h125v250h375v375z',
    'width': 6,
    'height': 7,
  },
  'S': {
    'path':
      'M125 125v125h125v125h250v125h375v250h500v125h125v250h125v125h625v125h125v125h250v125h375v250h500v125h125v250h125v125h625z',
    'width': 6,
    'height': 7,
  },
  'T': {
    'path': 'M375 125v750h250v125h750v125h250v750h250z',
    'width': 6,
    'height': 7,
  },
  'U': {
    'path': 'M125 125v125h125v750h250v750h375v750h250v750h125v125h625z',
    'width': 6,
    'height': 7,
  },
  'V': {
    'path':
      'M375 125v125h125v125h125v125h125v500h250v375h125v125h125v125h125v375h250v500h125v125h125v125h125v125h125z',
    'width': 6,
    'height': 7,
  },
  'W': {
    'path':
      'M125 125v125h125v750h250v500h125v500h125v500h125v500h250v750h125v125h125v125h125v125h125v125h125v125h125z',
    'width': 6,
    'height': 7,
  },
  'X': {
    'path':
      'M0 125v250h125v125h125v125h125v125h125v250h250v250h125v125h125v125h125v250h250v250h125v125h125v125h125v125h125v250h250v250h125v125h125v125h125v250h250z',
    'width': 6,
    'height': 7,
  },
  'Y': {
    'path': 'M375 125v375h125v125h125v375h250v375h250v375h250v375h125v125h125v375h250z',
    'width': 6,
    'height': 7,
  },
  'Z': {
    'path':
      'M0 125v250h125v125h125v125h125v125h125v125h500v125h875v250h125v125h125v125h125v125h125v125h500v125h875z',
    'width': 6,
    'height': 7,
  },
  '!': {
    'path': 'M250 375v625h375v375h125v250h250zM250 125v125h250v125h250z',
    'width': 6,
    'height': 7,
  },
  ',': {
    'path': 'M125 0v125h125v250h250v250h125v125h250z',
    'width': 6,
    'height': 7,
  },
  '.': {
    'path': 'M250 125v250h250v250h250z',
    'width': 6,
    'height': 7,
  },
  '?': {
    'path':
      'M250 375v125h250v125h125v125h375v125h250v250h125v125h625v125h125v250h125v125h125v125h375zM250 125v125h375v125h375z',
    'width': 6,
    'height': 7,
  },
  '0': {
    'path':
      'M250 125v125h125v125h125v375h125v125h125v125h375v125h125v125h125v375h125v125h125v125h375zM375 250h250v500h125v125h250v500h125v125z',
    'width': 6,
    'height': 7,
  },
  '1': {
    'path': 'M125 125v125h250v500h125v125h125v125h250v750h250v125h750z',
    'width': 6,
    'height': 7,
  },
  '2': {
    'path':
      'M0 125v250h125v125h125v125h250v125h125v125h375v125h250v125h125v125h625v125h125v250h125v125h125v125h250v125h500v125h875z',
    'width': 6,
    'height': 7,
  },
  '3': {
    'path':
      'M125 125v125h125v125h250v125h375v250h375v125h125v125h125v125h375v125h750v125h125v125h125v125h125v125h125v250h125v125h625z',
    'width': 6,
    'height': 7,
  },
  '4': {
    'path':
      'M500 125v250h500v250h125v125h125v125h125v125h375v500h125v125h125v250h250zM250 500h250v250h125v125h125v125z',
    'width': 6,
    'height': 7,
  },
  '5': {
    'path':
      'M125 125v125h125v125h250v125h375v375h625v375h750v125h500v125h500v125h125v375h125v125h625z',
    'width': 6,
    'height': 7,
  },
  '6': {
    'path':
      'M125 125v125h125v500h125v125h125v125h500v125h375v125h125v125h500v125h125v250h125v125h625zM250 250h375v250h375v250z',
    'width': 6,
    'height': 7,
  },
  '7': {
    'path':
      'M250 125v375h125v125h125v125h125v125h375v125h250v250h875v250h125v125h125v125h125v375h250z',
    'width': 6,
    'height': 7,
  },
  '8': {
    'path':
      'M125 125v125h125v250h125v125h125v250h125v125h500v125h125v250h125v125h250v250h125v125h625zM375 625h250v250h375v125h125v125zM125 250h500v125h250v125h250v250z',
    'width': 6,
    'height': 7,
  },
  '9': {
    'path':
      'M125 125v125h375v125h125v125h500v125h125v250h125v125h625v125h125v500h125v125h125v125h500zM250 625h375v250h375v250z',
    'width': 6,
    'height': 7,
  },
  '*': {
    'path':
      'M125 250v125h125v125h250v125h250v125h125v125h250v125h125v125h250v125h125v125h250v125h250v125h125v125h250v125h125v125h250z',
    'width': 6,
    'height': 7,
  },
  '\\': {
    'path':
      'M125 1000v125h125v125h125zM250 875v125h125v125h125zM375 750v125h125v125h125zM500 625v125h125v125h125zM625 500v125h125v125h125zM750 375v125h125v125h125zM875 250v125h125v125h125z',
    'width': 6,
    'height': 7,
  },
  ':': {
    'path': 'M250 625v250h250v250h250zM250 250v250h250v250h250z',
    'width': 6,
    'height': 7,
  },
  ';': {
    'path': 'M250 625v250h250v250h250zM125 125v125h125v250h250v250h125v125h250z',
    'width': 6,
    'height': 7,
  },
  '/': {
    'path':
      'M875 1000v125h125v125h125zM625 875h125v125h125v125zM500 750h125v125h125v125zM375 625h125v125h125v125zM250 500h125v125h125v125zM125 375h125v125h125v125zM0 250h125v125h125v125z',
    'width': 6,
    'height': 7,
  },
  '_': {
    'path': 'M0 0v125h875v125h875z',
    'width': 6,
    'height': 7,
  },
  '(': {
    'path':
      'M500 125v125h125v125h125v375h125v125h125v125h250v125h125v125h125v375h125v125h125v125h250z',
    'width': 6,
    'height': 7,
  },
  ')': {
    'path':
      'M125 125v125h125v125h125v375h125v125h125v125h250v125h125v125h125v375h125v125h125v125h250z',
    'width': 6,
    'height': 7,
  },
  '—': {
    'path': 'M0 500v125h1000v125h1000z',
    'width': 6,
    'height': 7,
  },
  '+': {
    'path': 'M375 250v250h250v125h250v250h250v250h250v125h250v250h250z',
    'width': 6,
    'height': 7,
  },
};

export default PressStart2PFont;
