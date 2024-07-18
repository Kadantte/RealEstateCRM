const CustomField = require("../../model/schema/customField");
const ModuleActiveDeactive = require("../../model/schema/moduleActiveDeactive");

const index = async (req, res) => {
    try {
        const query = req?.query;

        // Fetch custom fields data and filter non-default and non-deleted fields
        const customFieldsData = await CustomField?.find({ deleted: false });
        const customFieldsDeletedData = await CustomField?.find({ deleted: true });

        const filteredCustomFields = customFieldsData?.map((item) => ({
            ...item?.toObject(),
            fields: item?.fields?.filter(field => !field?.isDefault && !field?.delete),
        }));
        filteredCustomFields?.sort((a, b) => a?.no - b?.no);

        // Fetch active/inactive modules based on query
        let data = await ModuleActiveDeactive?.find(query);

        let routes = [
            "Dashboard",
            "Leads",
            "Contacts",
            "Properties",
            "Email Template",
            "Tasks",
            "Meetings",
            "Calls",
            "Emails",
            "Calender",
            "Payments",
            "Opportunities",
            "Reporting and Analytics",
            "Account",
            "Quotes",
            "Invoices",
            "Documents",
        ];

        filteredCustomFields?.map(item => item?.moduleName)?.forEach((item) => {
            !routes?.includes(item) && routes?.push(item)
        })

        const existingModuleNames = data?.map(record => record?.moduleName);
        const missingRoutes = routes?.filter(route => !existingModuleNames?.includes(route));

        // Insert missing routes
        if (missingRoutes?.length) {
            await ModuleActiveDeactive?.insertMany(
                missingRoutes?.map(route => ({ moduleName: route }))
            );
        }

        customFieldsDeletedData?.forEach(async (item) => {
            await ModuleActiveDeactive.deleteOne({ moduleName: item?.moduleName })
        })

        // Fetch updated modules
        data = await ModuleActiveDeactive?.find(query);

        return res.status(200).json(data);
    } catch (err) {
        console.error("Error :", err);
        return res.status(400).json({ err, error: "Something wents wrong" });
    }
};

const Edit = async (req, res) => {
    try {
        const updates = req.body;

        const updatePromises = updates.map(update => {
            return ModuleActiveDeactive.updateOne(
                { _id: update._id },
                { $set: { isActive: update.isActive } }
            );
        });

        await Promise.all(updatePromises);

        res.status(200).send('update successful');
    } catch (err) {
        console.error("Error :", err);
        return res.status(400).json({ err, error: "Something wents wrong" });
    }
};

module.exports = { index, Edit };