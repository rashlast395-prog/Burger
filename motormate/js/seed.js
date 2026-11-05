/* Default store content. The server copies this into the database on first run; everything here is editable in /admin. */
(function(){
const W=(p,f,s)=>`https://upload.wikimedia.org/wikipedia/commons/thumb/${p}/${f}/${s||960}px-${f}`;
const BG={
 hilux:W("8/81","Toyota_HiLux_GR_Sport_1X7A7281.jpg"),
 mech:W("4/42","Car_mechanic_worker_repairing_suspension_of_lifted_automobile_at_auto_repair_garage_shop.jpg"),
 truck:W("8/89","Oil_filter_and_Fuel_filter_of_UD_Trucks%2C.jpg"),
 mech2:W("b/b9","Young_mechanic_with_laptop_doing_car_diagnostic_at_automobile_repair_shop_close.jpg")
};
const C=(id,name,group,icon)=>({id,name,slug:id,group,icon,image:"",active:true});
const B=(id,name,country,flag)=>({id,name,country,flag,about:"",active:true});
const categories=[
 C("brakes","Brakes","Brakes & Suspension","brake"),
 C("suspension","Suspension & Steering","Brakes & Suspension","suspension"),
 C("engine","Engine Parts","Engine & Drivetrain","engine"),
 C("clutch","Clutch & Transmission","Engine & Drivetrain","gear"),
 C("exhaust","Exhaust & Turbo","Engine & Drivetrain","exhaust"),
 C("batteries","Batteries","Electrical & Lighting","battery"),
 C("electrical","Spark Plugs & Ignition","Electrical & Lighting","bolt"),
 C("lighting","Lighting","Electrical & Lighting","lamp"),
 C("cooling","Cooling","Cooling & Accessories","snow"),
 C("accessories","Accessories","Cooling & Accessories","toolbox")
];
const brands=[
 B("valeo","Valeo","France","fr"),B("hella","Hella","Germany","de"),B("monroe","Monroe","USA","us"),B("mobis","Hyundai Mobis","South Korea","kr"),
 B("brembo","Brembo","Italy","it"),B("borgwarner","BorgWarner","USA","us"),B("walker","Walker","USA","us"),B("mazda","Mazda Genuine","Japan","jp"),
 B("momo","MOMO","Italy","it"),B("bosch","Bosch","Germany","de"),B("acdelco","ACDelco","USA","us"),B("supercharge","SuperCharge","Australia","au"),
 B("ngk","NGK","Japan","jp"),B("philips","Philips","Netherlands","nl")
];
// [name, category, brand, price, old price (0 = none), stock, image file, image background]
const P=[
["Valeo Complete Clutch Kit with Flywheel & Release Bearing (4-Piece)","clutch","valeo",1850,2400,8,"clutch-kit.png"],
["Honda Civic Black Projector LED Headlights (Pair)","lighting","hella",1450,1900,6,"led-headlights.webp"],
["Monroe Complete Front Coil-Over Strut Assembly (Pair)","suspension","monroe",1380,1850,10,"strut-assembly.png"],
["Hyundai Mobis Front Suspension, Control Arm & Brake Disc Assembly","suspension","mobis",2950,3600,4,"front-suspension.png"],
["Brembo Drilled Brake Disc with Red 4-Piston Caliper","brakes","brembo",4200,5200,5,"brake-disc-caliper.png"],
["Valeo Aluminium Core Radiator – Toyota Hilux / Land Cruiser","cooling","valeo",1250,1700,7,"radiator.webp"],
["BorgWarner Billet-Wheel Performance Turbocharger (T4 Flange)","exhaust","borgwarner",5800,7200,3,"turbocharger.webp"],
["Walker Stainless Steel Dual-Tip Performance Muffler","exhaust","walker",780,1050,9,"muffler.png"],
["Mazda SKYACTIV-D 2.2L Diesel Engine Assembly","engine","mazda",24500,28000,2,"diesel-engine.png"],
["MOMO 5-Speed Leather & Chrome Gear Shift Knob","accessories","momo",180,260,25,"gear-knob.png","#000"],
["Bosch Heavy-Duty Semi-Metallic Brake Pads (Set)","brakes","bosch",420,560,22,"brake-pads.webp"],
["ACDelco 6.0L V8 Aluminium Engine Block (Bare)","engine","acdelco",9800,11500,2,"engine-block.png"],
["SuperCharge Gold 12V Sealed MF Car Battery – 36 Months Warranty","batteries","supercharge",1150,1450,18,"battery.webp"],
["NGK Iridium IX Spark Plugs (Pair)","electrical","ngk",160,230,60,"spark-plugs.png"],
["Philips Automotive Bulb Assortment Kit – P21W, R10W, PY21W (7 Types)","lighting","philips",120,180,40,"bulb-kit.png"]
];
const products=P.map((p,i)=>({id:"p"+(i+1),name:p[0],slug:"p"+(i+1),cat:p[1],brand:p[2],price:p[3],old:p[4],stock:p[5],image:"img/"+p[6],bg:p[7]||"",
 desc:"Quality-checked "+p[0]+". Confirm fitment by sending us your car make, model, year or chassis (VIN) on WhatsApp before ordering. Backed by the MotorMate Ghana quality guarantee.",
 specs:"Condition: New\nWarranty: 6 months\nFitment: Please confirm with your VIN\nDelivery: Same-day in Accra, 1–3 days nationwide",active:true,featured:i%3===0}));
categories.forEach(c=>{const p=products.find(x=>x.cat===c.id);if(p)c.image=p.image});
(typeof window!=="undefined"?window:globalThis).SEED=(function(){return {
settings:{
 name:"MotorMate Ghana",logoText:"MOTORMATE",logoSub:"GHANA",tagline:"Genuine auto spare parts, delivered across Ghana",
 phone:"+233 59 197 2828",whatsapp:"233591972828",email:"hello@motormateghana.com",address:"Accra, Ghana",
 currency:"GH₵",pointsRate:3,deliveryFee:30,freeShippingOver:1500,
 green:"#35a73b",dark:"#000000",
 topbarText:"Need help placing an order? You can contact us directly on WhatsApp via",
 topbarButton:"Request a Part",
 navLinks:[{label:"Brakes",url:"shop.html?cat=brakes"},{label:"Engine Parts",url:"shop.html?cat=engine"},{label:"Suspension",url:"shop.html?cat=suspension"},{label:"Batteries",url:"shop.html?cat=batteries"},{label:"Lighting",url:"shop.html?cat=lighting"},{label:"Exhaust & Turbo",url:"shop.html?cat=exhaust"},{label:"MotorMate Black November Deals",url:"shop.html?deals=1"},{label:"Jijenge na MotorPoints",url:"page.html?slug=motorpoints"}],
 footer:{account:[{label:"Order History",url:"account.html"},{label:"Track Order",url:"track.html"},{label:"Wishlist",url:"wishlist.html"},{label:"Shopping Cart",url:"cart.html"}],help:[{label:"FAQ's",url:"help.html"},{label:"Shipping and Delivery Policy",url:"page.html?slug=shipping"},{label:"Customer Service",url:"help.html#contact"}],market:[{label:"How to Shop",url:"page.html?slug=how-to-shop"},{label:"Terms & Conditions",url:"page.html?slug=terms"}]},
 copyright:"MotorMate Ghana © 2026. All Rights Reserved.",
 dealEnds:"2026-11-30T23:59:59",dealTitle:"MotorMate Black November deals are now live",
 trust:[{icon:"truck",title:"Fast and Reliable Delivery",text:"Same day delivery within Accra"},{icon:"chat",title:"Great Customer Support",text:"Instant access to Chat"},{icon:"shield",title:"Guaranteed Product Quality",text:"No fake parts with money back guarantee"}],
 waTitle:"Join Our WhatsApp Channel",waText:"Get exclusive access to Black November deals before anyone else!",
 waBullets:["Get instant notifications on our flash sales","Be the first to know when new parts drop","First access to clearance items and promotions"],
 paymentMethods:["Pay on Delivery","Mobile Money (MoMo)","Bank Transfer"]
},
announcements:[
 {id:"a1",text:"Black November: up to 30% off brakes, batteries and engine parts",link:"shop.html?deals=1",active:true},
 {id:"a2",text:"Free delivery in Accra on orders above GH₵ 1,500",link:"page.html?slug=shipping",active:true}
],
slides:[
 {id:"s1",title:"Genuine Spare Parts for Every Drive",subtitle:"Engines, clutches, turbos and more – cars and trucks",button:"Shop Now",link:"shop.html",image:BG.hilux,products:"p9,p1,p7",active:true},
 {id:"s2",title:"Brakes, Struts & Suspension",subtitle:"Stop safer and ride smoother with Brembo, Monroe & Bosch",button:"Shop Brakes",link:"shop.html?cat=brakes",image:BG.mech,products:"p5,p3,p11",active:true},
 {id:"s3",title:"Power Up: Batteries, Plugs & Lights",subtitle:"SuperCharge, NGK, Philips and Hella – start every time",button:"Shop Electrical",link:"shop.html?cat=batteries",image:BG.truck,products:"p13,p14,p2",active:true},
 {id:"s4",title:"Cooling, Exhaust & Performance",subtitle:"Radiators, mufflers and turbochargers with fast delivery",button:"Request a Part",link:"#request",image:BG.mech2,products:"p6,p8,p10",active:true}
],
categories,brands,products,
sections:[
 {id:"h1",title:"The biggest discounts this week (Up to 30% OFF)",source:"discount",limit:8,active:true},
 {id:"h2",title:"Keep your engine running strong",source:"cat:engine,clutch,exhaust",limit:8,active:true},
 {id:"h3",title:"Brakes & suspension deals",source:"cat:brakes,suspension",limit:8,active:true},
 {id:"h4",title:"Great Deals on Electrical & Lighting",source:"cat:batteries,electrical,lighting",limit:8,active:true},
 {id:"h5",title:"Exclusive MotorMate Offers and Hidden Gems",source:"featured",limit:8,active:true}
],
banners:[
 {id:"b1",title:"Brake Parts – Up to 30% Off",image:BG.mech,link:"shop.html?cat=brakes",active:true},
 {id:"b2",title:"Engines & Drivetrain – Great Prices",image:BG.truck,link:"shop.html?cat=engine",active:true}
],
pages:[
 {slug:"how-to-shop",title:"How to Shop",html:"<ol><li>Search or browse by category, brand or country of origin.</li><li>Add parts to your cart and checkout – pay on delivery or by Mobile Money.</li><li>We confirm fitment with you on WhatsApp and deliver to your door.</li></ol>"},
 {slug:"terms",title:"Terms & Conditions",html:"<p>By ordering from MotorMate Ghana you agree to our terms. Parts must be unused and in original packaging to qualify for a return within 7 days. Electrical parts are non-returnable once installed. Edit this page in the admin panel.</p>"},
 {slug:"shipping",title:"Shipping and Delivery Policy",html:"<p><b>Accra:</b> same-day delivery for orders placed before 2pm. <b>Other regions:</b> 1–3 working days via our courier partners. Delivery is free for orders above the free-shipping threshold.</p>"},
 {slug:"motorpoints",title:"Jijenge na MotorPoints",html:"<p>Earn MotorPoints on every purchase and redeem them on future orders. Edit this page in the admin panel.</p>"},
 {slug:"faq",title:"FAQ's",html:"<details><summary>How do I know a part fits my car?</summary><p>Send us your make, model, year or VIN on WhatsApp and we will confirm fitment before shipping.</p></details><details><summary>Are your parts genuine?</summary><p>Yes. Every part is quality-checked and we offer a money-back guarantee on counterfeits.</p></details><details><summary>Which payment methods do you accept?</summary><p>Pay on delivery, Mobile Money and bank transfer.</p></details><details><summary>Do you deliver outside Accra?</summary><p>Yes, nationwide in 1–3 working days.</p></details>"}
]
};})();
})();
if(typeof module!=="undefined")module.exports=globalThis.SEED;
