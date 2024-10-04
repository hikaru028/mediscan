import { Skeleton } from "@/components/ui/skeleton"

const TableSkeleton = () => {
	return (
		<div>
			<div className='h-[760px] bg-table py-2 rounded-3xl mt-2 flex flex-col items-end overflow-y-auto'>
				{/* Filter and Search Bar */}
				<div className="w-full flex justify-end mb-8 mt-3 mr-3">
					<Skeleton className="w-[150px] h-10 mr-3 rounded-full" />
					<Skeleton className='w-[270px] h-10 mr-2 rounded-full' />
				</div>

				{/* Table Skeleton - Header */}
				<div className="w-full h-full overflow-hidden px-5">
					<Skeleton className="h-[50px] w-full mb-2 rounded-xl" />

					{/* Table Rows */}
					<div className="space-y-1">
						<Skeleton className="h-[60px] w-full rounded-lg" />
						<Skeleton className="h-[60px] w-full rounded-lg" />
						<Skeleton className="h-[60px] w-full rounded-lg" />
						<Skeleton className="h-[60px] w-full rounded-lg" />
						<Skeleton className="h-[60px] w-full rounded-lg" />
						<Skeleton className="h-[60px] w-full rounded-lg" />
						<Skeleton className="h-[60px] w-full rounded-lg" />
						<Skeleton className="h-[60px] w-full rounded-lg" />
						<Skeleton className="h-[60px] w-full rounded-lg" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default TableSkeleton;
