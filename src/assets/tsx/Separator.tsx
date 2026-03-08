export default function Separator(props: React.SVGProps<SVGSVGElement>) {
   return (
      <svg width="6" height="21" viewBox="0 0 6 21" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
         <g filter="url(#filter0_d_2024_4146)">
            <path d="M0 0H2V2H0V0Z" fill="#082EA2" />
            <path d="M3 3H5V5H3V3Z" fill="#082EA2" />
            <path d="M0 6H2V8H0V6Z" fill="#082EA2" />
            <path d="M3 9H5V11H3V9Z" fill="#082EA2" />
            <path d="M0 12H2V14H0V12Z" fill="#082EA2" />
            <path d="M3 15H5V17H3V15Z" fill="#082EA2" />
            <path d="M0 18H2V20H0V18Z" fill="#082EA2" />
         </g>
         <defs>
            <filter
               id="filter0_d_2024_4146"
               x="0"
               y="0"
               width="6"
               height="21"
               filterUnits="userSpaceOnUse"
               colorInterpolationFilters="sRGB"
            >
               <feFlood floodOpacity="0" result="BackgroundImageFix" />
               <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
               />
               <feOffset dx="1" dy="1" />
               <feComposite in2="hardAlpha" operator="out" />
               <feColorMatrix type="matrix" values="0 0 0 0 0.0745098 0 0 0 0 0.552941 0 0 0 0 0.901961 0 0 0 1 0" />
               <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2024_4146" />
               <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2024_4146" result="shape" />
            </filter>
         </defs>
      </svg>
   );
}
