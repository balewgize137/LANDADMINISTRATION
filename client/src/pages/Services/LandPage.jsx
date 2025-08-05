import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { connectWalletAndContract } from '../../utils/blockchainService';

const LandPage = () => {
    const navigate = useNavigate();

    // --- STATE MANAGEMENT: Merged original state with new blockchain state ---
    const [activeTab, setActiveTab] = useState('add-new-land');
    const [loading, setLoading] = useState(false); // For blockchain transactions
    const [account, setAccount] = useState(null); // For connected wallet address
    const [uploadedFiles, setUploadedFiles] = useState({}); // Your original file state

    // Your original useForm hooks remain unchanged
    const { register: registerForm, handleSubmit: handleNewSubmit, formState: { errors: newErrors } } = useForm();
    const { register: transferForm, handleSubmit: handleTransferSubmit, formState: { errors: transferErrors } } = useForm();
    const { register: permissionForm, handleSubmit: handlePermissionSubmit, formState: { errors: permissionErrors } } = useForm();

    // --- NEW: Wallet Connection Logic ---
    const handleConnectWallet = async () => {
        try {
            const { signer } = await connectWalletAndContract();
            setAccount(await signer.getAddress());
            toast.success('Wallet connected!');
        } catch (err) {
            toast.error("Failed to connect wallet.");
            console.error(err);
        }
    };

    // Your original file change handler remains unchanged
    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { toast.error('File size too large. Maximum size is 5MB.'); return; }
            setUploadedFiles(prev => ({ ...prev, [fieldName]: file }));
        }
    };

    // --- MODIFIED: Form submission now calls the smart contract instead of the API ---
    const onAddNewLand = async (data) => {
        if (!account) { toast.error("Please connect your wallet first."); return; }
        setLoading(true);
        try {
            const { contract } = await connectWalletAndContract();
            try { await (await contract.registerUser("Client User", "Land Owner")).wait(); } catch (e) { console.log("User may already be registered."); }
            
            const transaction = await contract.registerLand(data.location, data.size);
            await transaction.wait();
            toast.success('Land successfully registered on the blockchain!');
        } catch (err) {
            toast.error(err.reason || "Transaction failed.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const onTransferLand = async (data) => {
        if (!account) { toast.error("Please connect your wallet first."); return; }
        setLoading(true);
        try {
            const { contract } = await connectWalletAndContract();
            const transaction = await contract.transferLand(data.toAddress, data.landId);
            await transaction.wait();
            toast.success('Land successfully transferred on the blockchain!');
        } catch (err) {
            toast.error(err.reason || "Transaction failed.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const onGetPermission = async (data) => {
        if (!account) { toast.error("Please connect your wallet first."); return; }
        setLoading(true);
        try {
            const { contract } = await connectWalletAndContract();
            const transaction = await contract.grantBuildingPermission(data.landId);
            await transaction.wait();
            toast.success('Building permission granted on the blockchain!');
        } catch (err) {
            toast.error(err.reason || "Transaction failed. Note: Only the contract owner can do this.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'add-new-land', label: 'Add New Land', icon: ( <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg> ) },
        { id: 'transfer-land', label: 'Transfer Land', icon: ( <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> ) },
        { id: 'building-permission', label: 'Building Permission', icon: ( <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> ) }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Land Services</h1>
                        <p className="text-gray-600">Manage your land registrations and services</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/services/land/processes')} className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors">My Land Processes</button>
                        {account ? (
                            <div className="p-2 bg-green-100 text-green-800 rounded-lg text-sm shadow-sm">✅ Connected: <span className="font-mono">{`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</span></div>
                        ) : (
                            <button onClick={handleConnectWallet} className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors">Connect Wallet</button>
                        )}
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-soft overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6 overflow-x-auto">
                            {tabs.map((tab) => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    {tab.icon}<span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="p-6">
                        {activeTab === 'add-new-land' && (
                            <div>
                                <div className="mb-6"><h2 className="text-xl font-semibold text-gray-900 mb-2">Add New Land Registration</h2><p className="text-gray-600">Submit required documents for new land registration</p></div>
                                <form onSubmit={handleNewSubmit(onAddNewLand)} className="space-y-6">
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Land Information</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div><label className="form-label">Land Location</label><input {...registerForm('location', { required: 'Land location is required' })} className="form-input" placeholder="e.g. District, City" />{newErrors.location && <p className="form-error">{newErrors.location.message}</p>}</div>
                                            <div><label className="form-label">Land Size (Square Meters)</label><input {...registerForm('size', { required: 'Land size is required' })} type="number" className="form-input" placeholder="e.g. 1000" />{newErrors.size && <p className="form-error">{newErrors.size.message}</p>}</div>
                                            <div><label className="form-label">Land Type</label><select {...registerForm('landType', { required: 'Land type is required' })} className="form-select"><option value="">Select land type</option><option value="Residential">Residential</option><option value="Commercial">Commercial</option></select>{newErrors.landType && <p className="form-error">{newErrors.landType.message}</p>}</div>
                                            <div><label className="form-label">Current Use</label><input {...registerForm('currentUse', { required: 'Current use is required' })} className="form-input" placeholder="e.g. Vacant, Farm, Building" />{newErrors.currentUse && <p className="form-error">{newErrors.currentUse.message}</p>}</div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
                                        <div className="space-y-4">
                                            <div><label className="block text-sm font-medium text-gray-700 mb-2">Land Title Deed</label><input type="file" onChange={(e) => handleFileChange(e, 'landTitleDeed')} className="file-input" /></div>
                                            <div><label className="block text-sm font-medium text-gray-700 mb-2">Survey Plan</label><input type="file" onChange={(e) => handleFileChange(e, 'surveyPlan')} className="file-input" /></div>
                                            <div><label className="block text-sm font-medium text-gray-700 mb-2">Identification Document</label><input type="file" onChange={(e) => handleFileChange(e, 'identificationDocument')} className="file-input" /></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="submit" disabled={loading || !account} className="btn-primary px-8 py-3 disabled:opacity-50">{loading ? <div className="flex items-center"><LoadingSpinner size="small" className="mr-2" /> Submitting...</div> : 'Submit Registration'}</button>
                                    </div>
                                </form>
                            </div>
                        )}
                        {activeTab === 'transfer-land' && (
                            <div>
                                <div className="mb-6"><h2 className="text-xl font-semibold text-gray-900 mb-2">Land Transfer</h2><p className="text-gray-600">Transfer land ownership between persons</p></div>
                                <form onSubmit={handleTransferSubmit(onTransferLand)} className="space-y-6">
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Transfer Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div><label className="form-label">Recipient's Wallet Address</label><input {...transferForm('toAddress', { required: 'Recipient address is required' })} className="form-input" placeholder="0x..." />{transferErrors.toAddress && <p className="form-error">{transferErrors.toAddress.message}</p>}</div>
                                            <div><label className="form-label">Land ID to Transfer</label><input {...transferForm('landId', { required: 'Land ID is required' })} type="number" className="form-input" placeholder="e.g., 1" />{transferErrors.landId && <p className="form-error">{transferErrors.landId.message}</p>}</div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
                                        <div className="space-y-4">
                                            <div><label className="block text-sm font-medium text-gray-700 mb-2">Sales Agreement</label><input type="file" onChange={(e) => handleFileChange(e, 'salesAgreement')} /></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="submit" disabled={loading || !account} className="btn-primary px-8 py-3 disabled:opacity-50">{loading ? <div className="flex items-center"><LoadingSpinner size="small" className="mr-2" /> Submitting...</div> : 'Submit Transfer Request'}</button>
                                    </div>
                                </form>
                            </div>
                        )}
                        {activeTab === 'building-permission' && (
                            <div>
                                <div className="mb-6"><h2 className="text-xl font-semibold text-gray-900 mb-2">Building Permission</h2><p className="text-gray-600">Get permission to build on land</p></div>
                                <form onSubmit={handlePermissionSubmit(onGetPermission)} className="space-y-6">
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Permission Details</h3>
                                        <p className="text-sm text-yellow-600 p-2 bg-yellow-50 rounded mb-4">Note: Only the contract owner (admin) can perform this action.</p>
                                        <label className="form-label">Land ID</label>
                                        <input {...permissionForm('landId', { required: 'Land ID is required' })} type="number" className="form-input" placeholder="e.g., 1" />
                                        {permissionErrors.landId && <p className="form-error">{permissionErrors.landId.message}</p>}
                                    </div>
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
                                        <div className="space-y-4">
                                            <div><label className="block text-sm font-medium text-gray-700 mb-2">Building Plan</label><input type="file" onChange={(e) => handleFileChange(e, 'buildingPlan')} /></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="submit" disabled={loading || !account} className="btn-primary px-8 py-3 disabled:opacity-50">{loading ? <div className="flex items-center"><LoadingSpinner size="small" className="mr-2" /> Submitting...</div> : 'Submit Permission Request'}</button>
                                    </div>
                                </form>
                            </div>
                        )}
                        {!account && <p className="text-center text-sm text-gray-500 mt-4">Please connect your wallet to use these services.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandPage;