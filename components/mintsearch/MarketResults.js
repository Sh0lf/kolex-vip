import { useContext, useState } from "react";
import sortBy from "lodash/sortBy";
import uniqBy from "lodash/uniqBy";
import { FaSignature } from "react-icons/fa";
import { UserContext } from "@/context/UserContext";
import BigModal from "@/components/BigModal";
import ExportToCSV from "../ExportToCSV";
import Tooltip from "../Tooltip";
import MarketResultRow from "./MarketResultRow";

const MarketResults = ({
	showModal,
	setShowModal,
	results,
	loading,
	finished,
	filter,
	selectedCollection,
}) => {
	const { user, categoryId } = useContext(UserContext);
	const [hideBadDeals, setHideBadDeals] = useState(false);

	const suffix = filter.sigsOnly
		? "Signatures"
		: filter.upgradesOnly
		? "Point Upgrades"
		: `[${filter.batch}${filter.min}-${filter.batch}${filter.max}]`;

	const uniqResults = uniqBy(
		sortBy(results, [
			(o) => (o.card ? o.card.mintNumber : o.sticker.mintNumber),
			(o) => (o.card ? o.card.cardTemplateId : o.stickerTemplateId),
		]),
		(o) => o.marketId
	);

	const shownResults = hideBadDeals
		? uniqResults.filter((item, index) => {
				const sameTitles = uniqResults
					.slice(0, index)
					.find(
						(betterItem) =>
							betterItem.title === item.title &&
							Number(betterItem.price) <= Number(item.price) &&
							betterItem[betterItem.type].mintNumber <= item[item.type].mintNumber
					);
				return sameTitles ? false : true;
		  })
		: uniqResults;

	return (
		<BigModal
			header='Results'
			loading={loading}
			showModal={showModal}
			setShowModal={setShowModal}
			closingFunction={() => {
				finished.current = true;
			}}
			extraStyle='h-fit my-auto'
			hasToast={true}
			stopButton={
				!finished.current && (
					<button
						className='ml-2 rounded bg-red-400 p-1 font-semibold text-gray-800 hover:bg-red-500 active:bg-red-600 dark:text-gray-200'
						onClick={() => (finished.current = true)}
						title='Stop the search'
					>
						Stop
					</button>
				)
			}
			escapeClose={false}
		>
			<div className='max-h-full overflow-auto'>
				<table className='w-full table-auto'>
					<thead className='text-gray-custom bg-gray-200 dark:bg-gray-700'>
						<tr>
							<th className='table-cell'>Mint</th>
							<th className='table-cell'>Title</th>
							<th className='table-cell'>Price</th>
							<th className='hidden py-1 px-2 sm:table-cell sm:py-3 sm:px-6'>Min Offer</th>
							<th className='table-cell'>Point gain</th>
							<th className='table-cell'>Seller</th>
							<th className='table-cell'>Link</th>
							<th className='table-cell'>History</th>
							<th className='table-cell'>Buy</th>
						</tr>
					</thead>
					<tbody>
						{shownResults.map((item) => (
							<MarketResultRow
								item={item}
								allowed={user.info.allowed.includes("history")}
								key={item.marketId}
								categoryId={categoryId}
							/>
						))}
					</tbody>
				</table>
			</div>
			{results.length > 0 && (
				<div className='flex items-center p-3'>
					<div className='ml-2 flex flex-col'>
						<div className='inline-flex items-center'>
							<input
								type='checkbox'
								name='badDeals'
								id='badDeals'
								checked={hideBadDeals}
								onChange={(e) => setHideBadDeals(e.target.checked)}
								className='cursor-pointer accent-primary-600'
							/>
							<label htmlFor='badDeals' className='text-gray-custom ml-1 cursor-pointer'>
								Hide bad deals
							</label>
							<Tooltip
								direction='right'
								text='Hide items that have a better mint and cheaper alternative in the results'
							/>
						</div>
						<span className='inline-flex items-center text-yellow-500'>
							<FaSignature className='mr-2' /> Signed Item
						</span>
					</div>
					<div className='ml-auto'>
						<ExportToCSV
							data={shownResults}
							filename={`${selectedCollection.collection.properties.seasons[0]} - ${selectedCollection.collection.properties.tiers[0]} - ${selectedCollection.collection.name} - ${suffix} - Market`}
							type='market'
						/>
					</div>
				</div>
			)}
		</BigModal>
	);
};
export default MarketResults;
