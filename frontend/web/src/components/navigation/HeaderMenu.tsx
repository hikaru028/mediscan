'use client'

import { FC, Fragment } from 'react'
import { Product } from '@/components/products/ProductColumns'
import { DetailProduct } from '@/utils/index'
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from '@/components/ui/menubar'

interface HeaderMenuProps {
    products: Product[]
    detailData: DetailProduct[]
    setFilteredProducts: (products: Product[]) => void
    onCategoryChange: (category: string, subCategory?: string) => void;
    selectedCategory: string
}

const HeaderMenu: FC<HeaderMenuProps> = ({ products, selectedCategory, setFilteredProducts, onCategoryChange }) => {
    const handleCategoryChange = (category: string, subCategory?: string) => {
        onCategoryChange(category, subCategory);
    }

    return (
        <div className='w-full pt-2 flex justify-start items-center'>
            <Menubar className='w-full h-12 px-2 border-none flex justify-start items-center bg-table mr-4 rounded-full'>
                {Object.keys(categories).map((category) => (
                    <MenubarMenu key={category}>
                        <MenubarTrigger
                            onClick={() => handleCategoryChange(category)}
                            className={`flex justify-center items-center py-2 px-5 cursor-pointer rounded-full  ${selectedCategory === category ? 'bg-impact text-white' : ''}`}
                        >
                            {category}
                        </MenubarTrigger>
                        {category !== 'All' && (
                            <MenubarContent>
                                {categories[category].map((subCategory) => (
                                    <Fragment key={subCategory}>
                                        <MenubarItem onClick={() => handleCategoryChange(category, subCategory)}>
                                            {subCategory}
                                        </MenubarItem>
                                    </Fragment>
                                ))}
                            </MenubarContent>
                        )}
                    </MenubarMenu>
                ))}
            </Menubar>
        </div>
    )
}

export default HeaderMenu

type Categories = {
    [key: string]: string[]
};

const categories: Categories = {
    "All": [],
    "Therapeutic": [
        "Analgesics", "Antibiotics", "Antivirals", "Antifungals", "Antihistamines", "Antidepressants", "Antipsychotics", "Antihypertensives", "Diuretics", "Antidiabetics", "Statins", "Bronchodilators", "Corticosteroids", "Anticoagulants", "Immunosuppressants"
    ],
    "Formulation": [
        "Tablets", "Capsules", "Syrups", "Injections", "Creams/Ointments", "Inhalers", "Suppositories"
    ],
    "Systemic": [
        "Cardiovascular System", "Respiratory System", "Digestive System", "Nervous System", "Musculoskeletal System", "Endocrine System", "Urinary System", "Reproductive System", "Immune System"
    ],
    "Usage Duration": [
        "Acute", "Chronic", "PRN"
    ],
    "Prescription Status": [
        "Prescription-Only Medicines (POM)", "Over-The-Counter Medicines (OTC)", "Controlled Substances"
    ],
    "Target Population": [
        "Adults", "Paediatrics", "Geriatrics", "Pregnant/Breastfeeding Women"
    ],
    "Drug Classes": [
        "Beta-blockers", "ACE Inhibitors", "SSRIs", "NSAIDs", "Benzodiazepines", "Opioids"
    ]
};