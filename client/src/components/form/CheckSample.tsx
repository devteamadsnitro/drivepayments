const DELIMITER = "#8a8f96";

function TransitMark({ x }: { x: number }) {
  return (
    <g stroke={DELIMITER} strokeWidth="1.4" strokeLinecap="round">
      <line x1={x} y1={224} x2={x} y2={244} />
      <circle cx={x + 5} cy={234} r="1.7" fill={DELIMITER} stroke="none" />
      <line x1={x + 10} y1={224} x2={x + 10} y2={244} />
    </g>
  );
}

function Badge({ x, n }: { x: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={266} r="9" fill="#0b0e12" />
      <text
        x={x}
        y={269.5}
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="9.5"
        fontWeight="600"
        fill="#c9f24d"
      >
        {n}
      </text>
    </g>
  );
}

export function CheckSample() {
  return (
    <figure className="overflow-hidden rounded-2xl border border-line bg-paper/60 p-3 sm:p-4">
      <svg
        viewBox="0 0 720 300"
        role="img"
        aria-label="Cheque de ejemplo con el routing number, el número de cuenta y el número de cheque señalados en la franja inferior"
        className="w-full"
      >
        <rect x="20" y="16" width="680" height="268" rx="12" fill="#ffffff" stroke="#e2ded3" />

        {/* Banco */}
        <text
          x="48"
          y="56"
          fontFamily="'Instrument Sans', sans-serif"
          fontSize="13"
          fontWeight="600"
          fill="#0b0e12"
        >
          FIRST NATIONAL BANK
        </text>
        <text
          x="48"
          y="70"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="7.5"
          fill="#5c626b"
        >
          1200 Coral Way · Miami, FL 33145
        </text>

        <text
          x="672"
          y="52"
          textAnchor="end"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="8.5"
          fill="#5c626b"
        >
          Nº 1024
        </text>
        <text
          x="672"
          y="66"
          textAnchor="end"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="8.5"
          fill="#5c626b"
        >
          12 / 03 / 2026
        </text>

        {/* Beneficiario */}
        <text
          x="48"
          y="104"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="7"
          letterSpacing="1.2"
          fill="#8a8f96"
        >
          PÁGUESE A LA ORDEN DE
        </text>
        <text
          x="48"
          y="126"
          fontFamily="'Instrument Sans', sans-serif"
          fontSize="15"
          fontWeight="600"
          fill="#0b0e12"
        >
          DrivePayments LLC
        </text>
        <line x1="48" y1="134" x2="430" y2="134" stroke="#e2ded3" strokeWidth="1" />

        {/* Importe */}
        <rect x="540" y="96" width="132" height="40" rx="6" fill="#faf9f5" stroke="#e2ded3" />
        <text
          x="606"
          y="121"
          textAnchor="middle"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="13"
          fontWeight="500"
          fill="#0b0e12"
        >
          $ 12.450,00
        </text>

        {/* Concepto y firma */}
        <text
          x="48"
          y="168"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="8"
          fill="#5c626b"
        >
          CONCEPTO: liquidación semanal · marzo
        </text>
        <line x1="540" y1="166" x2="672" y2="166" stroke="#c8c2b2" strokeWidth="1" />
        <text
          x="606"
          y="178"
          textAnchor="middle"
          fontFamily="'Instrument Sans', sans-serif"
          fontSize="7"
          fill="#8a8f96"
        >
          Firma autorizada
        </text>
        <text
          x="672"
          y="194"
          textAnchor="end"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="6.5"
          letterSpacing="1.2"
          fill="#b8b2a4"
        >
          MUESTRA · NO VÁLIDO
        </text>

        {/* Franja MICR */}
        <rect x="40" y="206" width="176" height="36" rx="6" fill="#c9f24d" opacity="0.28" />
        <rect x="224" y="206" width="178" height="36" rx="6" fill="#e8eeff" />
        <rect x="458" y="206" width="122" height="36" rx="6" fill="#f0eee6" />

        <TransitMark x={50} />
        <text
          x="70"
          y="230"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="17"
          letterSpacing="2.4"
          fill="#0b0e12"
        >
          121000248
        </text>
        <TransitMark x={190} />

        <text
          x="236"
          y="230"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="17"
          letterSpacing="2.2"
          fill="#0b0e12"
        >
          000123456789
        </text>

        <TransitMark x={468} />
        <text
          x="488"
          y="230"
          fontFamily="'JetBrains Mono', monospace"
          fontSize="17"
          letterSpacing="2.4"
          fill="#0b0e12"
        >
          1024
        </text>
        <TransitMark x={546} />

        <Badge x={128} n={1} />
        <Badge x={313} n={2} />
        <Badge x={519} n={3} />
      </svg>

      <figcaption className="mt-3 grid gap-2 sm:grid-cols-3">
        {[
          { n: 1, title: "Routing number", value: "121000248" },
          { n: 2, title: "Número de cuenta", value: "000123456789" },
          { n: 3, title: "Número de cheque", value: "1024" },
        ].map((item) => (
          <div key={item.n} className="flex items-start gap-2">
            <span className="mt-[1px] flex size-5 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-[10px] font-semibold text-accent">
              {item.n}
            </span>
            <span className="min-w-0">
              <span className="block text-[12px] leading-tight font-medium text-ink">
                {item.title}
              </span>
              <span className="block font-mono text-[11px] text-ink-muted">{item.value}</span>
            </span>
          </div>
        ))}
      </figcaption>
    </figure>
  );
}
