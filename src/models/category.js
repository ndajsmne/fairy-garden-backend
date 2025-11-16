const db = require('../config/database');

// Helper: generate slug from name
function slugify(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with '-'
        .replace(/^-+|-+$/g, '') // trim leading/trailing '-'
        .replace(/-+/g, '-'); // collapse multiple '-'
}

class Category {
    static async getAll() {
        try {
            const [rows] = await db.query('SELECT * FROM categories ORDER BY name');
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async getById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async create(categoryData) {
        try {
            const { name, slug: providedSlug, description } = categoryData;
            const slug = (providedSlug && providedSlug.trim()) ? providedSlug.trim() : slugify(name);
            const [result] = await db.query(
                'INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)',
                [name, slug, description || null]
            );
            return {
                id: result.insertId,
                name,
                slug
            };
        } catch (error) {
            throw error;
        }
    }

    static async update(id, categoryData) {
        try {
            const { name, slug: providedSlug, description } = categoryData;
            // if slug missing but name provided, generate one
            const slug = (providedSlug && providedSlug.trim()) ? providedSlug.trim() : (name ? slugify(name) : null);
            await db.query(
                'UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?',
                [name, slug, description || null, id]
            );
            return this.getById(id);
        } catch (error) {
            throw error;
        }
    }

    static async delete(id) {
        try {
            const [result] = await db.query('DELETE FROM categories WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Category;