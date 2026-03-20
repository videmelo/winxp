export default function Minecraft() {
   return (
      <div style={{ width: '100%', height: '100%', margin: 0, padding: 0, overflow: 'hidden' }}>
         <iframe
            src="/minecraft/index.html"
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            title="Minecraft Classic"
            sandbox="allow-scripts allow-same-origin allow-pointer-lock"
         />
      </div>
   );
}
