const Pet = require('../models/Pet');
const Auth = require('../models/Auth');
const User = require("../models/User");
const Image = require('../models/Image');

module.exports = {

    async getPetByUserId(req, res) {
        const id = req.params.id;

        try {
            const pets = await Pet.find({ user: id });
            return res.status(200).json(pets);
        } catch (error) {
            return res.status(500).json({ "Error": "Invalid User Format" });
        }
    },

    async showallpets(req, res) {
        try {
            const pets = await Pet.find();
            await pets.reverse();
            const count = await pets.length;
            for (const item of pets) {
                const user = await User.find(item.user);
                item.info = user;
            }
            return res.status(200).json({ 'count': count, 'pets': pets });
        } catch (error) {
            return res.status(403).json({ 'Error': 'Cant Find Pets' });
        }

    },




    async createPet(req, res) {
        try {
            if (req.file) {
                const { originalname: name, size, key, location: url = "" } = req.file;
                const {
                    namePet,
                    color,
                    birthdate,
                    breed,
                } = req.body;
                const id = req.body.id;


                try {
                    const getuser = await User.findOne({ _id: id });

                    if (getuser) {
                        await Image.create({
                            name: name,
                            size: size,
                            key: key,
                            url: url,
                            user: id,
                        });
                        const pet = await Pet.create({
                            picture: `getFile/${name}`,
                            namePet: namePet,
                            color: color,
                            birthdate: birthdate,
                            breed: breed,
                            user: id,
                        })
                        return res.status(201).json(pet);
                    } else {
                        return res.status(401).json({ 'Error': 'User không tồn tại' });
                    }
                } catch (error) {
                    return res.status(500).json({ 'Error': error });
                }
            } else {
                try {
                    const {
                        namePet,
                        color,
                        birthdate,
                        breed,
                    } = req.body;
                    const id = req.body.id;

                    const getuser = await User.findOne({ _id: id });

                    if (getuser) {
                        const pet = await Pet.create({

                            namePet: namePet,
                            color: color,
                            birthdate: birthdate,
                            breed: breed,
                            user: id,
                        })
                        return res.status(201).json(pet);
                    } else {
                        return res.status(401).json({ 'Error': 'User Không tồn tại' });
                    }
                } catch (error) {
                    return res.status(500).json({ 'Error': error });
                }
            }
        } catch (error) {
            return res.status(500).json({ "Internal Server Error": error.message })
        }
    },

    async deletepet(req, res) {
        try {
            const { pet, id } = req.body;
            const user = await User.findOne({ _id: id });
            console.log(user);
            if (user) {
                const deletePet = await Pet.findOne({ _id: pet })
                console.log(deletePet);

                if (deletePet) {
                    deletePet.remove();
                    return res.status(200).json({ "success": "xóa thành công" });
                    // if (deletePet.user == auth.user) {
                    //     if (deletePet.picture != "InitialPetProfile.jpg") {
                    //         const image = await Image.findOne({ key: deletePet.picture })
                    //         image.remove();
                    //     }
                    //     deletePet.remove();
                    // } else {
                    //     return res.status(403).json({ "error": "User and pet does not match" });
                    // }
                } else {
                    return res.status(404).json({ "error": "Pet not found" })
                }
            } else {
                return res.status(401).json({ 'error': 'Invalid Token' });
            }
        } catch (error) {
            return res.status(500).json({ 'Internal Server Error': error.message });
        }
    },


    async UserDeleteAccount(id) {
        try {
            const user = await User.findOne({ _id: id });
            if (user) {
                const petsData = await Pet.findOne({ user: id });
                if (petsData) {
                    const image = await Image.findOne({ key: petsData.picture })
                    if (image) {
                        try {
                            await image.remove();
                            await petsData.remove();
                        } catch (error) {
                            return 0
                        }
                    } else {
                        try {
                            await petsData.remove();
                        } catch (error) {
                            return res.status(500).json({ "Internal Server Error": error.message });
                        }
                    }
                } else {
                    return 0
                }
            } else {
                return res.status(403).json({ "error": "Invalid Token" })
            }
        } catch (error) {
            return res.status(500).json({ 'Internal Server Error': error.message });
        }
    }
    /*
    async deleteallpets(req, res) {

        try {
            await Pet.deleteOne();
            await Pet.deleteOne();
            await Pet.deleteOne();
            await Pet.deleteOne();
            await Pet.deleteOne();
            await Pet.deleteOne();
            await Pet.deleteOne();
            await Pet.deleteOne();
            await Pet.deleteOne();
            await Pet.deleteOne();
            await Pet.deleteOne();
            await Pet.deleteOne();
            await Pet.deleteOne();
        } catch (error) {
        }
        return res.json({ message: 'Deleted' });
    }
*/

};