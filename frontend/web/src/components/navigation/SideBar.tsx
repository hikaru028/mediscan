import { FC } from 'react'
import Image from 'next/image'
import { SettingsModal } from '@/components'
import { NavigationMenu, NavigationMenuList } from '@/components/ui/navigation-menu'
import { Popover, PopoverTrigger } from '@/components/ui/popover'
import { Account } from '@/components'
import { useTheme } from 'next-themes';
import { CiSettings, CiMedicalClipboard, CiCamera } from "react-icons/ci";

const SideBar: FC<SideBarProps> = ({ onToggleCamera, onShowProducts }) => {
    const { theme, setTheme } = useTheme();

    const handleClick = (label: string) => {
        if (label === 'camera') {
            onToggleCamera()
        } else if (label === 'products') {
            onShowProducts()
        }
    }

    return (
        <aside className='min-w-40 h-full flex flex-col justify-start items-center m-auto bg-background overflow-hidden shadow-right'>
            {/* Logo */}
            <div className="flex flex-col items-center justify-center mt-4 mb-10">
                {theme === 'dark' ? (
                    <Image src="/images/logo-light.png" alt="logo" width={44} height={56} />
                ) : (
                    <Image src="/images/logo.png" alt="logo" width={44} height={56} />
                )}
            </div>
            {/* Navigation Menu */}
            <NavigationMenu className='flex flex-column justify-center items-start w-full m-auto'>
                <NavigationMenuList className='flex flex-col justify-center items-end gap-y-2'>
                    {navLinks.map((link, index) => (
                        <div key={index} className='w-full'>
                            {/* Camera */}
                            {link.label === 'camera' && (
                                <div
                                    onClick={() => handleClick(link.label)}
                                    className='w-full flex justify-start items-center gap-x-3 py-3 px-4 rounded-2xl bg-impact hover:shadow-lg hover:bg-impact/90 cursor-pointer mb-6'
                                >
                                    <div className='w-8 h-8 flex justify-center items-center'>
                                        <link.icon className='w-8 h-auto' />
                                    </div>
                                    <span className='text-base capitalize font-nomal'>
                                        {link.label}
                                    </span>
                                </div>
                            )}
                            {/* Settings */}
                            {link.label === 'settings' && (
                                <Popover>
                                    <PopoverTrigger
                                        onClick={() => handleClick(link.label)}
                                        className='w-full flex justify-start items-center gap-x-3 py-2 px-4 rounded-lg hover:bg-tint cursor-pointer'
                                    >
                                        <div className='w-6 h-6 flex justify-center items-center'>
                                            <link.icon className='w-6 h-auto text-impact stroke-[0.5]' />
                                        </div>
                                        <span className='text-sm capitalize font-normal'>
                                            {link.label}
                                        </span>
                                    </PopoverTrigger>
                                    <SettingsModal />
                                </Popover>
                            )}
                            {/* Products */}
                            {link.label === 'products' && (
                                <div
                                    onClick={() => handleClick(link.label)}
                                    className='w-full flex justify-start items-center gap-x-3 py-2 px-4 rounded-lg hover:bg-tint cursor-pointer'
                                >
                                    <div className='w-6 h-6 flex justify-center items-center'>
                                        <link.icon className='w-6 h-auto text-impact stroke-[0.5]' />
                                    </div>
                                    <span className='text-sm capitalize font-normal'>
                                        {link.label}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>

            {/* Account Section */}
            <div className='w-full mb-10 px-1'>
                <Account />
            </div>
        </aside >
    )
}

export default SideBar

interface SideBarProps {
    onToggleCamera: () => void
    onShowProducts: () => void
}

const navLinks = [
    { icon: CiCamera, path: '', label: 'camera' },
    { icon: CiMedicalClipboard, path: '/dashboard', label: 'products' },
    { icon: CiSettings, path: '', label: 'settings' },
];