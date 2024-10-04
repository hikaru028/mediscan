import { FC } from 'react'
import { PopoverContent } from '@/components/ui/popover'
import { ThemeToggler } from '@/components'

const SettingsModal: FC = () => {
    return (
        <PopoverContent className='flex flex-col justify-start items-start ml-8 rounded-2xl'>
            <div className='flex items-center'>
                <span className='mr-4 text-sm font-light'>Theme:</span>
                <ThemeToggler />
            </div>
        </PopoverContent>
    )
}

export default SettingsModal