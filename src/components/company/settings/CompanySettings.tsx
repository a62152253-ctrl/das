import React, { useMemo } from "react";
import {
  Save,
  MapPin,
  Clock,
  Compass,
  Info,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import { Company } from "../../../types";

interface Props {
  company: Company;
  onChange: (updated: Company) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const DAYS = [
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
  "Niedziela",
];


export function CompanySettings({
  company,
  onChange,
  onSubmit,
}: Props) {


  const updateCompany = (data: Partial<Company>) => {
    onChange({
      ...company,
      ...data,
    });
  };


  const packageName = useMemo(
    () =>
      company.visibilityPackage?.toUpperCase() || "FREE",
    [company.visibilityPackage]
  );


  const updateHours = (
    day: string,
    value: string
  ) => {

    updateCompany({
      openingHours: {
        ...company.openingHours,
        [day]: value,
      },
    });

  };


  const validateCoordinates = (
    value:number,
    type:"lat"|"lng"
  ) => {

    if(type==="lat"){
      return Math.min(
        Math.max(value,-90),
        90
      );
    }

    return Math.min(
      Math.max(value,-180),
      180
    );
  };



return (

<form
onSubmit={onSubmit}
className="
space-y-8
font-sans
"
>



{/* HEADER */}

<section>

<div className="flex items-center justify-between">

<div>

<h2
className="
text-xl
font-black
tracking-tight
text-slate-900
dark:text-white
"
>
Ustawienia firmy
</h2>


<p
className="
text-sm
text-slate-500
mt-1
"
>
Zarządzaj lokalizacją, widocznością oraz godzinami działania firmy.
</p>


</div>


<div
className="
flex
items-center
gap-2
px-3
py-2
rounded-xl
bg-emerald-50
dark:bg-emerald-900/20
text-emerald-600
text-xs
font-bold
"
>

<ShieldCheck size={16}/>

Profil aktywny

</div>


</div>

</section>




{/* PREMIUM CARDS */}

<div
className="
grid
md:grid-cols-2
gap-5
"
>


<Card>

<div
className="
flex
items-center
gap-3
"
>

<Sparkles
className="text-indigo-600"
/>

</div>


<p className="text-xs uppercase tracking-widest text-slate-400 mt-4">
Pakiet widoczności
</p>


<h3
className="
text-lg
font-black
mt-1
"
>
{packageName}
</h3>


<p
className="
text-sm
text-slate-500
mt-2
"
>
Zwiększ widoczność firmy oraz pozycję w wyszukiwarce.
</p>


</Card>




<Card>

<MapPin
className="text-indigo-600"
/>


<p className="text-xs uppercase tracking-widest text-slate-400 mt-4">
Mapa
</p>


<h3
className="
text-lg
font-black
mt-1
"
>
Lokalizacja aktywna
</h3>


<p
className="
text-sm
text-slate-500
mt-2
"
>
Klienci mogą znaleźć Twoją firmę na mapie.
</p>


</Card>



</div>





{/* LOCATION */}

<Section
icon={<Compass/>}
title="Pozycja na mapie"
description="Ustaw dokładną lokalizację firmy."
>


<div
className="
grid
md:grid-cols-2
gap-5
"
>


<Field
label="Latitude"
>

<input

type="number"

value={company.lat}

onChange={(e)=>
updateCompany({
lat:validateCoordinates(
Number(e.target.value),
"lat"
)
})
}

className="input"
/>


</Field>



<Field
label="Longitude"
>


<input

type="number"

value={company.lng}

onChange={(e)=>
updateCompany({
lng:validateCoordinates(
Number(e.target.value),
"lng"
)
})
}

className="input"
/>



</Field>


</div>



<div
className="
mt-5
flex
gap-3
rounded-2xl
bg-amber-50
dark:bg-amber-900/20
p-4
text-sm
"
>


<Info
className="
text-amber-600
shrink-0
"
/>


<p>
Podaj dokładne współrzędne z Google Maps.
Dokładna lokalizacja zwiększa zaufanie klientów.
</p>


</div>


</Section>







{/* HOURS */}


<Section

icon={<Clock/>}

title="Godziny otwarcia"

description="Ustaw dostępność firmy dla klientów."

>


<div
className="
space-y-3
"
>


{
DAYS.map(day=>(

<div
key={day}
className="
flex
items-center
justify-between
gap-4
p-4
rounded-xl
bg-slate-50
dark:bg-slate-900
"
>


<div
className="
font-bold
text-sm
"
>
{day}
</div>



<input

type="text"

value={
company.openingHours?.[day] || ""
}

onChange={(e)=>
updateHours(
day,
e.target.value
)
}


placeholder="08:00 - 16:00"

className="input max-w-xs"
/>



</div>


))

}



</div>



</Section>







<button

type="submit"

className="
flex
items-center
gap-3
px-7
py-3
rounded-2xl
bg-gradient-to-r
from-indigo-600
to-purple-600
text-white
font-black
shadow-lg
hover:scale-[1.02]
transition
"

>

<Save size={18}/>

Zapisz zmiany


</button>





</form>

);

}






function Card({
children
}:{
children:React.ReactNode
}){

return (

<div
className="
rounded-3xl
border
border-slate-200
dark:border-slate-800
bg-white
dark:bg-slate-950
p-6
shadow-sm
"
>

{children}

</div>

)

}




function Section({
icon,
title,
description,
children
}:{
icon:React.ReactNode;
title:string;
description:string;
children:React.ReactNode;
}){


return (

<section
className="
rounded-3xl
border
border-slate-200
dark:border-slate-800
bg-white
dark:bg-slate-950
p-7
space-y-6
"
>


<div className="
flex
gap-4
items-center
">


<div
className="
p-3
rounded-xl
bg-indigo-50
text-indigo-600
"
>

{icon}

</div>


<div>

<h3 className="font-black">
{title}
</h3>


<p className="text-sm text-slate-500">
{description}
</p>


</div>


</div>


{children}


</section>


)

}





function Field({
label,
children
}:{
label:string;
children:React.ReactNode
}){

return (

<div>

<label
className="
text-xs
font-bold
uppercase
tracking-wider
text-slate-500
"
>

{label}

</label>


{children}

</div>


)

}