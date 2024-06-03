const blog = require("../models/blog");
const blogCategory = require("../models/blogCategory");
const whyuserlove = require("../models/whyuserlove");
const caseManager = require("../models/caseManager");
const city = require("../models/city");
const category = require("../models/category.model");

exports.createBlogCategory = async (req, res) => {
        try {
                let image;
                if (req.file) {
                        image = req.file.path
                }
                const data = {
                        title: req.body.title,
                        image: image,
                };
                const BlogCategory = await blogCategory.create(data);
                return res.status(200).json({ message: "BlogCategory add successfully.", status: 200, data: BlogCategory });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.updateBlogCategory = async (req, res) => {
        try {
                const findData = await blogCategory.findById(req.params.id);
                if (!findData) {
                        return res.status(400).send({ msg: "not found" });
                }
                let image;
                if (req.file) {
                        image = req.file.path
                } else {
                        image = findData.image
                }
                const data = {
                        title: req.body.title ?? findData.title,
                        image: image,
                };
                const BlogCategory = await blogCategory.findByIdAndUpdate({ _id: findData._id }, { $set: data }, { new: true })
                return res.status(200).json({ message: "BlogCategory update successfully.", status: 200, data: BlogCategory });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getBlogCategory = async (req, res) => {
        try {
                const data = await blogCategory.find({})
                if (data.length === 0) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "blogCategory data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getIdBlogCategory = async (req, res) => {
        try {
                const data = await blogCategory.findById(req.params.id)
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "BlogCategory data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
}
exports.deleteBlogCategory = async (req, res) => {
        try {
                const data = await blogCategory.findByIdAndDelete(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).send({ msg: "deleted", data: data });
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ msg: "internal server error", error: err.message, });
        }
};
exports.createBlog = async (req, res) => {
        try {
                let image;
                if (req.file) {
                        image = req.file.path
                }
                const data = await blogCategory.findById(req.body.blogCategoryId)
                if (!data) {
                        return res.status(400).send({ msg: "blogCategory not found" });
                }
                const data1 = {
                        title: req.body.title,
                        description: req.body.description,
                        blogCategoryId: req.body.blogCategoryId,
                        image: image,
                };
                const BlogCategory = await blog.create(data1);
                return res.status(200).json({ message: "Blog add successfully.", status: 200, data: BlogCategory });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getBlog = async (req, res) => {
        try {
                if (req.query.blogCategoryId != (null || undefined)) {
                        const data = await blog.find({ blogCategoryId: req.query.blogCategoryId, })
                        if (data.length == 0) {
                                return res.status(400).send({ msg: "not found" });
                        }
                        return res.status(200).json({ status: 200, message: "Blog notes data found.", data: data });
                }
                const data = await blog.find({})
                if (data.length == 0) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "Blog notes data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getIdBlog = async (req, res) => {
        try {
                const data = await blog.findById(req.params.id)
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                }
                const BlogCategory = await blog.findByIdAndUpdate({ _id: data._id }, { $set: { view: data.view + 1 } }, { new: true })
                return res.status(200).json({ status: 200, message: "blog data found.", data: BlogCategory });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
}
exports.deleteBlog = async (req, res) => {
        try {
                const data = await blog.findByIdAndDelete(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).send({ msg: "deleted", data: data });
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ msg: "internal server error", error: err.message, });
        }
};
exports.updateBlog = async (req, res) => {
        try {
                const findData = await blog.findById(req.params.id);
                if (!findData) {
                        return res.status(400).send({ msg: "not found" });
                }
                let image, blogCategoryId;
                if (req.file) {
                        image = req.file.path;
                } else {
                        image = findData.image;
                }
                if (req.body.blogCategoryId != (null || undefined)) {
                        const data = await blogCategory.findById(req.body.blogCategoryId)
                        if (!data) {
                                return res.status(400).send({ msg: "blogCategory not found" });
                        }
                        blogCategoryId = req.body.blogCategoryId
                } else {
                        blogCategoryId = findData.blogCategoryId
                }
                const data = {
                        title: req.body.title ?? findData.title,
                        description: req.body.description ?? findData.description,
                        type: findData.type,
                        blogCategoryId: blogCategoryId,
                        image: image,
                };
                const BlogCategory = await blog.findByIdAndUpdate({ _id: findData._id }, { $set: data }, { new: true })
                return res.status(200).json({ message: "Blog update successfully.", status: 200, data: BlogCategory });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getBlogPopular = async (req, res) => {
        try {
                let data = await blog.find({}).sort({ view: -1 })
                if (data.length == 0) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "Blog notes data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.createWhyUserLove = async (req, res) => {
        try {
                let image;
                if (req.file) {
                        image = req.file.path
                }
                const data1 = {
                        title: req.body.title,
                        description: req.body.description,
                        image: image,
                        type: "whyuserlove"
                };
                const BlogCategory = await whyuserlove.create(data1);
                return res.status(200).json({ message: "WhyUserLove add successfully.", status: 200, data: BlogCategory });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getWhyUserLove = async (req, res) => {
        try {
                const data = await whyuserlove.find({ type: "whyuserlove" })
                if (data.length == 0) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "WhyUserLove notes data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getIdWhyUserLove = async (req, res) => {
        try {
                const data = await whyuserlove.findById(req.params.id)
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "WhyUserLove data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
}
exports.deleteWhyUserLove = async (req, res) => {
        try {
                const data = await whyuserlove.findByIdAndDelete(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).send({ msg: "deleted", data: data });
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ msg: "internal server error", error: err.message, });
        }
};
exports.updateWhyUserLove = async (req, res) => {
        try {
                const findData = await whyuserlove.findById(req.params.id);
                if (!findData) {
                        return res.status(400).send({ msg: "not found" });
                }
                let image;
                if (req.file) {
                        image = req.file.path;
                } else {
                        image = findData.image;
                }
                const data = {
                        title: req.body.title ?? findData.title,
                        description: req.body.description ?? findData.description,
                        image: image,
                        type: "whyuserlove"
                };
                const BlogCategory = await whyuserlove.findByIdAndUpdate({ _id: findData._id }, { $set: data }, { new: true })
                return res.status(200).json({ message: "WhyUserLove update successfully.", status: 200, data: BlogCategory });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.createTrustedBy = async (req, res) => {
        try {
                let image;
                if (req.file) {
                        image = req.file.path
                }
                const data1 = {
                        image: image,
                        type: "trustedBy"
                };
                const BlogCategory = await whyuserlove.create(data1);
                return res.status(200).json({ message: "trustedBy add successfully.", status: 200, data: BlogCategory });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getTrusted = async (req, res) => {
        try {
                const data = await whyuserlove.find({ type: "trustedBy" })
                if (data.length == 0) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "trustedBy notes data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getIdTrustedBy = async (req, res) => {
        try {
                const data = await whyuserlove.findById(req.params.id)
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "trustedBy data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
}
exports.deleteTrustedBy = async (req, res) => {
        try {
                const data = await whyuserlove.findByIdAndDelete(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).send({ msg: "deleted", data: data });
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ msg: "internal server error", error: err.message, });
        }
};
exports.updateTrustedBy = async (req, res) => {
        try {
                const findData = await whyuserlove.findById(req.params.id);
                if (!findData) {
                        return res.status(400).send({ msg: "not found" });
                }
                let image;
                if (req.file) {
                        image = req.file.path;
                } else {
                        image = findData.image;
                }
                const data = {
                        image: image,
                        type: "trustedBy"
                };
                const BlogCategory = await whyuserlove.findByIdAndUpdate({ _id: findData._id }, { $set: data }, { new: true })
                return res.status(200).json({ message: "trustedBy update successfully.", status: 200, data: BlogCategory });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.createCaseManager = async (req, res) => {
        try {
                let image, descriptionArray = [];
                if (req.files['descriptionImage'] != (null || undefined)) {
                        let docs = req.files['descriptionImage'];
                        for (let i = 0; i < docs.length; i++) {
                                let obj = {
                                        title: req.body.titleArray[i],
                                        description: req.body.descriptionArray[i],
                                        img: docs[i].path
                                }
                                if (docs[i].size > 3 * 1024 * 1024) {
                                        return res.status(413).send({ status: 413, message: "Image is too large.", data: {} });
                                }
                                descriptionArray.push(obj)
                        }
                }
                if (req.files['image'] != (null || undefined)) {
                        let docs = req.files['image'];
                        if (docs.size > 3 * 1024 * 1024) {
                                return res.status(413).send({ status: 413, message: "Image is too large.", data: {} });
                        }
                        image = docs[0].path
                }
                const data1 = {
                        title: req.body.title,
                        description: req.body.description,
                        image: image,
                        descriptionArray: descriptionArray,
                };
                const BlogCategory = await caseManager.create(data1);
                return res.status(200).json({ message: "Blog add successfully.", status: 200, data: BlogCategory });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getCaseManager = async (req, res) => {
        try {
                const data = await caseManager.find({})
                if (data.length == 0) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "Blog notes data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getIdCaseManager = async (req, res) => {
        try {
                const data = await caseManager.findById(req.params.id)
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                }
                const BlogCategory = await caseManager.findByIdAndUpdate({ _id: data._id }, { $set: { view: data.view + 1 } }, { new: true })
                return res.status(200).json({ status: 200, message: "blog data found.", data: BlogCategory });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
}
exports.deleteCaseManager = async (req, res) => {
        try {
                const data = await caseManager.findByIdAndDelete(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).send({ msg: "deleted", data: data });
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ msg: "internal server error", error: err.message, });
        }
};
exports.updateCaseManager = async (req, res) => {
        try {
                const findData = await caseManager.findById(req.params.id);
                if (!findData) {
                        return res.status(400).send({ msg: "not found" });
                }
                let image, descriptionArray = [];
                if (req.files['descriptionImage'] != (null || undefined)) {
                        let docs = req.files['descriptionImage'];
                        for (let i = 0; i < docs.length; i++) {
                                let obj = {
                                        title: req.body.titleArray[i],
                                        description: req.body.descriptionArray[i],
                                        img: docs[i].path
                                }
                                if (docs[i].size > 3 * 1024 * 1024) {
                                        return res.status(413).send({ status: 413, message: "Image is too large.", data: {} });
                                }
                                descriptionArray.push(obj)
                        }
                } else {
                        descriptionArray = findData.descriptionArray
                }
                if (req.files['image'] != (null || undefined)) {
                        let docs = req.files['image'];
                        if (docs.size > 3 * 1024 * 1024) {
                                return res.status(413).send({ status: 413, message: "Image is too large.", data: {} });
                        }
                        image = docs[0].path
                } else {
                        image = findData.image
                }
                const data = {
                        title: req.body.title ?? findData.title,
                        description: req.body.description ?? findData.description,
                        image: image,
                        descriptionArray: descriptionArray,
                };
                const BlogCategory = await caseManager.findByIdAndUpdate({ _id: findData._id }, { $set: data }, { new: true })
                return res.status(200).json({ message: "Blog update successfully.", status: 200, data: BlogCategory });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.createCity = async (req, res) => {
        try {
                let image;
                if (req.file) {
                        image = req.file.path
                }
                const data = {
                        city: req.body.city,
                        image: image,
                };
                const BlogCategory = await city.create(data);
                return res.status(200).json({ message: "City add successfully.", status: 200, data: BlogCategory });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.updateCity = async (req, res) => {
        try {
                const findData = await city.findById(req.params.id);
                if (!findData) {
                        return res.status(400).send({ msg: "not found" });
                }
                let image;
                if (req.file) {
                        image = req.file.path
                } else {
                        image = findData.image
                }
                const data = {
                        city: req.body.city ?? findData.city,
                        image: image,
                };
                const BlogCategory = await city.findByIdAndUpdate({ _id: findData._id }, { $set: data }, { new: true })
                return res.status(200).json({ message: "City update successfully.", status: 200, data: BlogCategory });
        } catch (error) {
                return res.status(500).json({ status: 500, message: "internal server error ", data: error.message, });
        }
};
exports.getCity = async (req, res) => {
        try {
                const data = await city.find({})
                if (data.length === 0) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "City data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.getIdCity = async (req, res) => {
        try {
                const data = await city.findById(req.params.id).populate('governmentCategoryId legalCategoryId')
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "City data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
}
exports.getCityPopular = async (req, res) => {
        try {
                let data = await city.find({}).sort({ popular: -1 })
                if (data.length == 0) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).json({ status: 200, message: "Blog notes data found.", data: data });
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
};
exports.deleteCity = async (req, res) => {
        try {
                const data = await city.findByIdAndDelete(req.params.id);
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                }
                return res.status(200).send({ msg: "deleted", data: data });
        } catch (err) {
                console.log(err.message);
                return res.status(500).send({ msg: "internal server error", error: err.message, });
        }
};
exports.assignCategoryToCity = async (req, res) => {
        try {
                const data = await city.findById(req.params.id)
                if (!data) {
                        return res.status(400).send({ msg: "not found" });
                } else {
                        const data1 = await category.findById({ _id: req.body.categoryId });
                        if (!data1) {
                                return res.status(400).send({ msg: "not found" });
                        } else {
                                if (data1.type == "legal") {
                                        let update = await city.findByIdAndUpdate({ _id: data._id }, { $push: { legalCategoryId: data1._id } }, { new: true })
                                        return res.status(200).json({ status: 200, message: "Assign Category To City successfully.", data: update });
                                }
                                if (data1.type == "government") {
                                        let update = await city.findByIdAndUpdate({ _id: data._id }, { $push: { governmentCategoryId: data1._id } }, { new: true })
                                        return res.status(200).json({ status: 200, message: "Assign Category To City successfully.", data: update });
                                }
                        }
                }
        } catch (err) {
                return res.status(500).send({ msg: "internal server error ", error: err.message, });
        }
}