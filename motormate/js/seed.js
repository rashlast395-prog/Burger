/* Default store content. The server copies this into data/db.json on first run; everything here is editable in /admin. */
(function(){
const W=(p,f,s)=>`https://upload.wikimedia.org/wikipedia/commons/thumb/${p}/${f}/${s||500}px-${f}`;
const IMG={
 battery:W("4/4c","Car_battery.jpg"),
 spark:W("7/7c","Spark_plug_2.jpg"),
 shock:W("6/6d","Close-up_of_a_car_mechanic_holding_a_shock_absorber.jpg"),
 alt:W("5/56","Alternator_voltage_regulator.jpg"),
 belt:W("3/3b","Cinghia_distribuzione.JPG"),
 clutch:W("1/10","Clutch_discs.jpg"),
 muffler:W("7/7c","Exhaust_pipe_muffler.JPG"),
 truckf:W("8/89","Oil_filter_and_Fuel_filter_of_UD_Trucks%2C.jpg"),
 bulb:W("6/62","045_Replacing_car_headlight_bulb_-_HIR2_type_12V_halogen_lightbulb_for_Toyota_Auris.jpg"),
 filter:W("4/43","Engine_oil_filter_cutaway.JPG"),
 hilux:W("8/81","Toyota_HiLux_GR_Sport_1X7A7281.jpg",960),
 hilux2:W("0/08","2026_Toyota_Hilux_Z.jpg",960),
 mech:W("4/42","Car_mechanic_worker_repairing_suspension_of_lifted_automobile_at_auto_repair_garage_shop.jpg",960),
 mech2:W("b/b9","Young_mechanic_with_laptop_doing_car_diagnostic_at_automobile_repair_shop_close.jpg",960),
 truckf9:W("8/89","Oil_filter_and_Fuel_filter_of_UD_Trucks%2C.jpg",960),
 battery9:W("4/4c","Car_battery.jpg",960)
};
const C=(id,name,group,icon,img)=>({id,name,slug:id,group,icon,image:img||"",active:true});
const B=(id,name,country,flag,about)=>({id,name,country,flag,about:about||"",active:true});
const categories=[
 C("brakes","Brakes","Brakes & Suspension","brake"),
 C("suspension","Suspension & Steering","Brakes & Suspension","suspension",IMG.shock),
 C("engine","Engine Parts","Engine & Drivetrain","engine",IMG.belt),
 C("filters","Filters","Engine & Drivetrain","filter",IMG.filter),
 C("clutch","Clutch & Transmission","Engine & Drivetrain","gear",IMG.clutch),
 C("exhaust","Exhaust","Engine & Drivetrain","exhaust",IMG.muffler),
 C("batteries","Batteries","Electrical & Lighting","battery",IMG.battery),
 C("electrical","Alternators & Ignition","Electrical & Lighting","bolt",IMG.alt),
 C("lighting","Lighting","Electrical & Lighting","lamp",IMG.bulb),
 C("oils","Oils & Fluids","Cooling & Fluids","oil"),
 C("cooling","Cooling","Cooling & Fluids","snow"),
 C("tyres","Tyres & Wheels","Wheels & Body","tyre"),
 C("body","Body Parts","Wheels & Body","car"),
 C("trucks","Truck & Heavy Duty","Trucks & Accessories","truck",IMG.truckf),
 C("accessories","Accessories & Tools","Trucks & Accessories","toolbox")
];
const brands=[
 B("toyota","Toyota Genuine","Japan","jp"),B("denso","Denso","Japan","jp"),B("ngk","NGK","Japan","jp"),B("kyb","KYB","Japan","jp"),B("bridgestone","Bridgestone","Japan","jp"),
 B("bosch","Bosch","Germany","de"),B("continental","Continental","Germany","de"),B("hella","Hella","Germany","de"),B("mann","Mann-Filter","Germany","de"),B("sachs","Sachs","Germany","de"),
 B("mobil","Mobil 1","USA","us"),B("monroe","Monroe","USA","us"),B("gates","Gates","USA","us"),
 B("castrol","Castrol","United Kingdom","gb"),B("exide","Exide","United Kingdom","gb"),
 B("michelin","Michelin","France","fr"),B("valeo","Valeo","France","fr"),
 B("brembo","Brembo","Italy","it"),B("mobis","Hyundai Mobis","South Korea","kr"),B("hankook","Hankook","South Korea","kr")
];
// [name, category, brand, price, old price (0 = none), stock, image key]
const P=[
["Toyota Corolla Front Brake Pad Set (2009-2018) – Ceramic","brakes","toyota",320,520,24,""],
["Brembo Ventilated Front Brake Discs (Pair) – Mercedes C-Class","brakes","brembo",1450,2100,8,""],
["Bosch Rear Brake Shoes – Nissan Almera","brakes","bosch",210,300,15,""],
["Hyundai Elantra Front Brake Pads – Genuine","brakes","mobis",290,0,20,""],
["KYB Excel-G Front Shock Absorber (Pair) – Toyota RAV4","suspension","kyb",980,1450,12,"shock"],
["Monroe Rear Shock Absorber – Kia Sportage","suspension","monroe",520,760,10,"shock"],
["Sachs Front Strut Assembly – Mercedes E-Class","suspension","sachs",1650,2300,5,"shock"],
["Nissan Navara Front Lower Control Arm – Left","suspension","toyota",720,1100,6,""],
["Gates Timing Belt Kit with Water Pump – Toyota Hilux","engine","gates",890,1300,9,"belt"],
["Denso Iridium Spark Plugs (Set of 4) – Honda/Toyota","engine","denso",380,640,40,"spark"],
["NGK Laser Iridium Spark Plug – Single","engine","ngk",95,140,80,"spark"],
["BMW 3 Series Hydraulic Engine Mount","engine","bosch",540,780,7,""],
["Mann-Filter Oil Filter – Hyundai/Kia 1.6L","filters","mann",55,85,60,"filter"],
["Bosch Air Filter – Nissan Almera","filters","bosch",70,110,45,"filter"],
["Denso Cabin Pollen Filter – Toyota Corolla","filters","denso",65,0,38,"filter"],
["Toyota Genuine Oil Filter 90915-YZZF2","filters","toyota",48,0,70,"filter"],
["Valeo Clutch Kit 3-Piece – Mitsubishi L200","clutch","valeo",1380,1900,6,"clutch"],
["Sachs Clutch Disc & Pressure Plate – VW Golf","clutch","sachs",1120,1500,5,"clutch"],
["Stainless Steel Rear Muffler – Toyota Corolla","exhaust","denso",480,700,9,"muffler"],
["Catalytic Converter Universal Fit 2.5\"","exhaust","bosch",1250,1700,4,"muffler"],
["Bosch S4 12V 70Ah Car Battery – Maintenance Free","batteries","bosch",1150,1500,18,"battery"],
["Exide Excel 12V 100Ah Truck Battery","batteries","exide",1850,0,11,"battery"],
["Exide Premium 12V 60Ah Car Battery","batteries","exide",980,1250,22,"battery"],
["Jump Starter Power Bank 12V 20000mAh","batteries","bosch",520,800,14,"battery"],
["Denso Alternator 12V 120A – Ford Ranger","electrical","denso",1750,2400,5,"alt"],
["Bosch Starter Motor – Toyota RAV4 (Reman)","electrical","bosch",950,1350,6,"alt"],
["Hella H4 LED Headlight Bulbs 6000K (Pair)","lighting","hella",180,420,35,"bulb"],
["Toyota Camry Headlight Assembly – Left","lighting","hella",650,900,6,"bulb"],
["Valeo Fog Lamp Kit – Honda CR-V","lighting","valeo",310,450,9,"bulb"],
["Mobil 1 5W-30 Fully Synthetic Engine Oil – 4L","oils","mobil",420,560,50,""],
["Castrol GTX 20W-50 Engine Oil – 5L","oils","castrol",310,380,64,""],
["Castrol Edge 0W-20 Full Synthetic – 4L","oils","castrol",460,610,30,""],
["Brake Fluid DOT 4 – 1L","oils","bosch",45,0,90,""],
["Honda Civic Aluminium Radiator","cooling","valeo",1250,1800,5,""],
["Engine Coolant Antifreeze Concentrate 4L","cooling","castrol",95,0,55,""],
["Michelin Primacy 4 Tyre 205/55R16","tyres","michelin",1350,1600,16,""],
["Bridgestone Ecopia 195/65R15","tyres","bridgestone",980,1200,20,""],
["Hankook Dynapro AT2 265/65R17 (SUV)","tyres","hankook",1850,2300,8,""],
["Continental ContiPremiumContact 215/60R16","tyres","continental",1480,1800,12,""],
["Honda CR-V Rear Bumper – Primed","body","toyota",1600,2200,3,""],
["Toyota Vitz Side Mirror Assembly – Right","body","toyota",260,380,12,""],
["Mack/UD Truck Oil & Fuel Filter Set","trucks","mann",360,520,14,"truckf"],
["Heavy Duty Truck Air Brake Chamber","trucks","bosch",780,1050,6,""],
["Bosch Aero Twin Wiper Blades 22\"/18\"","accessories","bosch",120,190,40,""],
["Waterproof Car Floor Mats – 5 Piece","accessories","toyota",150,260,26,""],
["Dash Camera 1080P with Night Vision","accessories","hella",340,520,15,""],
["Professional 120-Piece Socket & Tool Set","accessories","bosch",480,720,10,""]
];
const products=P.map((p,i)=>({id:"p"+(i+1),name:p[0],slug:"p"+(i+1),cat:p[1],brand:p[2],price:p[3],old:p[4],stock:p[5],image:p[6]?IMG[p[6]]:"",
 desc:"Quality-checked "+p[0]+". Confirm fitment by sending us your car make, model, year or chassis (VIN) on WhatsApp before ordering. Backed by the MotorMate Ghana quality guarantee.",
 specs:"Condition: New\nWarranty: 6 months\nFitment: Please confirm with your VIN\nDelivery: Same-day in Accra, 1–3 days nationwide",active:true,featured:i%5===0}));
(typeof window!=="undefined"?window:globalThis).SEED=module_exports();
function module_exports(){return {
settings:{
 name:"MotorMate Ghana",logoText:"MOTORMATE",logoSub:"GHANA",tagline:"Genuine auto spare parts, delivered across Ghana",
 phone:"+233 59 197 2828",whatsapp:"233591972828",email:"hello@motormateghana.com",address:"Accra, Ghana",
 currency:"GH₵",pointsRate:3,deliveryFee:30,freeShippingOver:1500,
 green:"#35a73b",dark:"#000000",
 topbarText:"Need help placing an order? You can contact us directly on WhatsApp via",
 topbarButton:"Request a Part",
 navLinks:[{label:"Brakes",url:"shop.html?cat=brakes"},{label:"Engine Parts",url:"shop.html?cat=engine"},{label:"Batteries",url:"shop.html?cat=batteries"},{label:"Tyres & Wheels",url:"shop.html?cat=tyres"},{label:"Oils & Fluids",url:"shop.html?cat=oils"},{label:"Truck Parts",url:"shop.html?cat=trucks"},{label:"MotorMate Black November Deals",url:"shop.html?deals=1"},{label:"Jijenge na MotorPoints",url:"page.html?slug=motorpoints"}],
 footer:{account:[{label:"Order History",url:"account.html"},{label:"Track Order",url:"track.html"},{label:"Wishlist",url:"wishlist.html"},{label:"Shopping Cart",url:"cart.html"}],help:[{label:"FAQ's",url:"help.html"},{label:"Shipping and Delivery Policy",url:"page.html?slug=shipping"},{label:"Customer Service",url:"help.html#contact"}],market:[{label:"How to Shop",url:"page.html?slug=how-to-shop"},{label:"Terms & Conditions",url:"page.html?slug=terms"}]},
 copyright:"MotorMate Ghana © 2026. All Rights Reserved.",
 dealEnds:"2026-11-30T23:59:59",dealTitle:"MotorMate Black November deals are now live",
 trust:[{icon:"truck",title:"Fast and Reliable Delivery",text:"Same day delivery within Accra"},{icon:"chat",title:"Great Customer Support",text:"Instant access to Chat"},{icon:"shield",title:"Guaranteed Product Quality",text:"No fake parts with money back guarantee"}],
 waTitle:"Join Our WhatsApp Channel",waText:"Get exclusive access to Black November deals before anyone else!",
 waBullets:["Get instant notifications on our flash sales","Be the first to know when new parts drop","First access to clearance items and promotions"],
 paymentMethods:["Pay on Delivery","Mobile Money (MoMo)","Bank Transfer"]
},
announcements:[
 {id:"a1",text:"Black November: up to 30% off brake parts, batteries and filters",link:"shop.html?deals=1",active:true},
 {id:"a2",text:"Free delivery in Accra on orders above GH₵ 1,500",link:"page.html?slug=shipping",active:true}
],
slides:[
 {id:"s1",title:"Genuine Spare Parts for Every Drive",subtitle:"Toyota, Hyundai, Kia, Nissan, Honda, Mercedes & more",button:"Shop Now",link:"shop.html",image:IMG.hilux,active:true},
 {id:"s2",title:"Brakes, Shocks & Suspension",subtitle:"Stop safer and ride smoother with parts from Brembo, KYB & Monroe",button:"Shop Brakes",link:"shop.html?cat=brakes",image:IMG.mech,active:true},
 {id:"s3",title:"Trucks & Heavy Duty Parts",subtitle:"Filters, brake chambers, batteries and more to keep your fleet moving",button:"Shop Truck Parts",link:"shop.html?cat=trucks",image:IMG.truckf9,active:true},
 {id:"s4",title:"Diagnostics, Fitment & Fast Delivery",subtitle:"Send us your VIN and we will match the exact part",button:"Request a Part",link:"#request",image:IMG.mech2,active:true}
],
categories,brands,products,
sections:[
 {id:"h1",title:"The biggest discounts this week (Up to 50% OFF)",source:"discount",limit:8,active:true},
 {id:"h2",title:"Keep your engine running strong",source:"cat:engine",limit:8,active:true},
 {id:"h3",title:"Great Deals on Batteries & Electrical",source:"cat:batteries",limit:8,active:true},
 {id:"h4",title:"Oils, Filters & Fluids",source:"cat:filters",limit:8,active:true},
 {id:"h5",title:"Exclusive MotorMate Offers and Hidden Gems",source:"featured",limit:8,active:true}
],
banners:[
 {id:"b1",title:"Brake Parts – Up to 30% Off",image:IMG.mech,link:"shop.html?cat=brakes",active:true},
 {id:"b2",title:"Batteries – Up to 25% Off",image:IMG.battery9,link:"shop.html?cat=batteries",active:true}
],
pages:[
 {slug:"how-to-shop",title:"How to Shop",html:"<ol><li>Search or browse by category, brand or country of origin.</li><li>Add parts to your cart and checkout – pay on delivery or by Mobile Money.</li><li>We confirm fitment with you on WhatsApp and deliver to your door.</li></ol>"},
 {slug:"terms",title:"Terms & Conditions",html:"<p>By ordering from MotorMate Ghana you agree to our terms. Parts must be unused and in original packaging to qualify for a return within 7 days. Electrical parts are non-returnable once installed. Edit this page in the admin panel.</p>"},
 {slug:"shipping",title:"Shipping and Delivery Policy",html:"<p><b>Accra:</b> same-day delivery for orders placed before 2pm. <b>Other regions:</b> 1–3 working days via our courier partners. Delivery is free for orders above the free-shipping threshold.</p>"},
 {slug:"motorpoints",title:"Jijenge na MotorPoints",html:"<p>Earn MotorPoints on every purchase and redeem them on future orders. Edit this page in the admin panel.</p>"},
 {slug:"faq",title:"FAQ's",html:"<details><summary>How do I know a part fits my car?</summary><p>Send us your make, model, year or VIN on WhatsApp and we will confirm fitment before shipping.</p></details><details><summary>Are your parts genuine?</summary><p>Yes. Every part is quality-checked and we offer a money-back guarantee on counterfeits.</p></details><details><summary>Which payment methods do you accept?</summary><p>Pay on delivery, Mobile Money and bank transfer.</p></details><details><summary>Do you deliver outside Accra?</summary><p>Yes, nationwide in 1–3 working days.</p></details>"}
]
};}
})();
if(typeof module!=="undefined")module.exports=globalThis.SEED;
