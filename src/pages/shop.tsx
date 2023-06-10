import useStore from "@/lib/useStore";
import useAuthStore from "@/lib/store";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

type Vendor = {
  businessCity: string;
  businessEmail: string;
  businessName: string;
  businessPhone: string;
  businessPostalCode: string;
  businessRegion: string;
  businessStreetAddress: string;
  businessCountry: string;
  businessWallet: string;
  points: number;
};

const Shop = () => {
  const store = useStore(useAuthStore, (state) => state);
  const [vendor, setVendor] = useState<Vendor>({
    businessCity: "",
    businessEmail: "",
    businessName: "",
    businessPhone: "",
    businessPostalCode: "",
    businessRegion: "",
    businessStreetAddress: "",
    businessCountry: "",
    businessWallet: "",
    points: 0,
  });

  useEffect(() => {
    const getData = async () => {
      const docRef = doc(db, "vendors", `${store?.wallet}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        const data = docSnap.data() as Vendor;
        setVendor(data);
      } else {
        console.log("No such document!");
      }
    };
    getData();
  }, [store?.wallet]);

  const products = [
    {
      id: 1,
      name: "Nomad Pouch",
      href: "#",
      price: "$50 LYLT",
      availability: "White and Black",
      imageSrc:
        "https://tailwindui.com/img/ecommerce-images/category-page-07-product-01.jpg",
      imageAlt:
        "White fabric pouch with white zipper, black zipper pull, and black elastic loop.",
    },
    {
      id: 2,
      name: "Zip Tote Basket",
      href: "#",
      price: "$140 LYLT",
      availability: "Washed Black",
      imageSrc:
        "https://tailwindui.com/img/ecommerce-images/category-page-07-product-02.jpg",
      imageAlt:
        "Front of tote bag with washed black canvas body, black straps, and tan leather handles and accents.",
    },
    {
      id: 3,
      name: "Medium Stuff Satchel",
      href: "#",
      price: "$220 LYLT",
      availability: "Blue",
      imageSrc:
        "https://tailwindui.com/img/ecommerce-images/category-page-07-product-03.jpg",
      imageAlt:
        "Front of satchel with blue canvas body, black straps and handle, drawstring top, and front zipper pouch.",
    },
    // More products...
  ];

  return (
    <div className="mx-auto max-w-7xl px-16 pb-16">
      <div className="mx-auto overflow-hidden px-4 lg:px-8">
        {/* <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
          {products.map((product) => (
            <a key={product.id} href={product.href} className="group text-sm">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                <img
                  src={product.imageSrc}
                  alt={product.imageAlt}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <h3 className="mt-4 font-medium text-gray-900">{product.name}</h3>
              <p className="italic text-gray-500">{product.availability}</p>
              <p className="mt-2 font-medium text-gray-900">{product.price}</p>
            </a>
          ))}
        </div> */}
      </div>
    </div>
  );
};

export default Shop;
