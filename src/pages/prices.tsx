import { useEffect, useState } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { RadioGroup } from "@headlessui/react";

const includedFeatures = [
  "Unlimited Promotions",
  "Analytics",
  "Marketplace Membership",
  "Frictionless Dashboard",
  "Earn rewards",
  "Unlimited Locations",
];

const frequencies = [
  { value: "monthly", label: "Monthly", priceSuffix: "/month" },
  { value: "annually", label: "Annually", priceSuffix: "/year" },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

const Prices = () => {
  const [frequency, setFrequency] = useState(frequencies[0]);
  return (
    <div className="mx-auto max-w-7xl">
      <div className="bg-white py-16 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple no-tricks pricing
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We simply have a monthly subscription, cancel any time.
            </p>
          </div>

          <div className="mx-auto max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none shadow-lg justify-between">
            <div className="p-8 sm:p-10 lg:flex-auto">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                Monthly membership
              </h3>
              <p className="mt-6 text-base leading-7 text-gray-600">
                Our membership program gets you access to a lot of perks unseen
                in other loyalty program services. Gain insight into your
                customers and reward engagement in creative ways.
              </p>
              <div className="mt-10 flex items-center gap-x-4">
                <h4 className="flex-none text-sm font-semibold leading-6 text-green-600">
                  What’s included
                </h4>
                <div className="h-px flex-auto bg-gray-100" />
              </div>
              <ul
                role="list"
                className="mt-8 grid grid-cols-1 gap-1 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6"
              >
                {includedFeatures.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      className="h-6 w-5 flex-none text-green-600"
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0 flex justify-center">
              <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                <div className="mx-auto max-w-xs px-8">
                  <div className="flex justify-center">
                    <RadioGroup
                      value={frequency}
                      onChange={setFrequency}
                      className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200"
                    >
                      <RadioGroup.Label className="sr-only">
                        Payment frequency
                      </RadioGroup.Label>
                      {frequencies.map((option) => (
                        <RadioGroup.Option
                          key={option.value}
                          value={option}
                          className={({ checked }) =>
                            classNames(
                              checked
                                ? "bg-green-600 text-white"
                                : "text-gray-500",
                              "cursor-pointer rounded-full px-2.5 py-1"
                            )
                          }
                        >
                          <span>{option.label}</span>
                        </RadioGroup.Option>
                      ))}
                    </RadioGroup>
                  </div>
                  <p className="mt-6 flex items-baseline justify-center gap-x-2">
                    <span className="text-5xl font-bold tracking-tight text-gray-900">
                      {frequency.value == "monthly" ? "$49.99" : "$39.99"}
                    </span>
                    <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">
                      USD /month
                    </span>
                  </p>
                  <a
                    href="#"
                    className="mt-10 block w-full rounded-md bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                  >
                    Get access
                  </a>
                  <p className="mt-6 text-xs leading-5 text-gray-600">
                    Invoices and receipts available for easy company
                    reimbursement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prices;
