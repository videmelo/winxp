import { useState } from 'react';
import { Button } from '../../ui/Button';
import { Checkbox } from '../../ui/CheckBox';
import Separator from '../../../assets/tsx/Separator';
import { RadioButton } from '../../ui/RadioButton';
import SlideCursor from '../../../assets/tsx/SlideCursor';
import { Slider } from '../../ui/Slider';

const components = ['Button', 'ButtonHug', 'Checkbox', 'RadioButton', 'Separator', 'SlideCursor'] as const;
type ComponentName = (typeof components)[number];

function ButtonPreview() {
   return (
      <div className="flex flex-col gap-3">
         <h3 className="font-bold text-sm font-['Tahoma']">Button</h3>
         <div className="flex flex-wrap gap-2 items-center">
            <Button>Default</Button>
            <Button disabled>Disabled</Button>
         </div>
      </div>
   );
}

function ButtonHugPreview() {
   return (
      <div className="flex flex-col gap-3">
         <h3 className="font-bold text-sm font-['Tahoma']">ButtonHug</h3>
         <div className="flex flex-wrap gap-2 items-center">
            <Button hug>Action</Button>
            <Button hug disabled>
               Disabled
            </Button>
         </div>
      </div>
   );
}

function RadioButtonPreview() {
   const [selected, setSelected] = useState('option1');

   return (
      <div className="flex flex-col gap-3">
         <h3 className="font-bold text-sm font-['Tahoma']">RadioButton</h3>
         <div className="flex flex-col gap-2">
            <RadioButton label="Option 1" checked={selected === 'option1'} onChange={() => setSelected('option1')} />
            <RadioButton label="Option 2" checked={selected === 'option2'} onChange={() => setSelected('option2')} />
            <RadioButton label="Option 3" checked={selected === 'option3'} onChange={() => setSelected('option3')} />
         </div>
      </div>
   );
}

function CheckboxPreview() {
   const [checked, setChecked] = useState(false);
   const [checked2, setChecked2] = useState(true);

   return (
      <div className="flex flex-col gap-3">
         <h3 className="font-bold text-sm font-['Tahoma']">Checkbox</h3>
         <div className="flex flex-col gap-2">
            <Checkbox label="Unchecked" checked={checked} onChange={() => setChecked(!checked)} />
            <Checkbox label="Checked" checked={checked2} onChange={() => setChecked2(!checked2)} />
            <Checkbox label="Unknown" unknown checked />
            <Checkbox label="Disabled" disabled />
            <Checkbox label="Disabled checked" disabled checked />
            <Checkbox label="Fill mode" fill checked={checked} onChange={() => setChecked(!checked)} />
         </div>
      </div>
   );
}

function SeparatorPreview() {
   return (
      <div className="flex flex-col gap-3">
         <h3 className="font-bold text-sm font-['Tahoma']">Separator</h3>
         <div className="flex items-center gap-2 bg-[#1560e5] p-2 rounded">
            <Separator />
         </div>
      </div>
   );
}

function SlideCursorPreview() {
   const [sliderValue, setSliderValue] = useState(35);

   return (
      <div className="flex flex-col gap-3">
         <h3 className="font-bold text-sm font-['Tahoma']">SlideCursor</h3>
         <div className="flex items-center gap-2 p-2 rounded">
            <SlideCursor variant="left" />
            <SlideCursor variant="right" />
            <SlideCursor />
            <SlideCursor orientation="vertical" />
            <SlideCursor orientation="vertical" variant="left" />
            <SlideCursor orientation="vertical" variant="right" />

            <Slider value={sliderValue} onChange={setSliderValue} variant="left" endLabel="End" startLabel="Start" />

            <Slider value={sliderValue} onChange={setSliderValue} variant="none" endLabel="End" startLabel="Start" />

            <Slider value={sliderValue} onChange={setSliderValue} variant="right" endLabel="End" startLabel="Start" />

            <Slider
               value={sliderValue}
               onChange={setSliderValue}
               orientation="vertical"
               size={96}
               variant="none"
               endLabel="End"
               startLabel="Start"
            />
         </div>
      </div>
   );
}

const previews: Record<ComponentName, React.FC> = {
   Button: ButtonPreview,
   ButtonHug: ButtonHugPreview,
   Checkbox: CheckboxPreview,
   RadioButton: RadioButtonPreview,
   Separator: SeparatorPreview,
   SlideCursor: SlideCursorPreview,
};

export default function ComponentPreview() {
   const [selected, setSelected] = useState<ComponentName>('Button');
   const Preview = previews[selected];

   return (
      <div className="flex h-full font-['Tahoma'] text-xs">
         {/* Sidebar */}
         <div className="w-40 shrink-0 border-r border-gray-300 bg-white overflow-y-auto">
            <div className="p-2 font-bold text-[11px] bg-linear-to-b from-blue-100 to-blue-50 border-b border-gray-300">
               Components
            </div>
            {components.map((name) => (
               <button
                  key={name}
                  className={`w-full text-left px-3 py-1.5 text-[11px] cursor-default ${
                     selected === name ? 'bg-[#316ac5] text-white' : 'hover:bg-[#e8e8e8]'
                  }`}
                  onClick={() => setSelected(name)}
               >
                  {name}
               </button>
            ))}
         </div>

         {/* Preview area */}
         <div className="flex-1 overflow-auto p-4 bg-white">
            <Preview />
         </div>
      </div>
   );
}
