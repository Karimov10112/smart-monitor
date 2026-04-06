class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return await this.model.create(data);
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findOne(query) {
    return await this.model.findOne(query);
  }

  async find(query = {}, options = {}) {
    const { sort, limit, skip, populate, select } = options;
    let execution = this.model.find(query);

    if (select) execution = execution.select(select);
    if (populate) execution = execution.populate(populate);
    if (sort) execution = execution.sort(sort);
    if (skip) execution = execution.skip(skip);
    if (limit) execution = execution.limit(limit);

    return await execution;
  }

  async findByIdAndUpdate(id, data, options = { new: true }) {
    return await this.model.findByIdAndUpdate(id, data, options);
  }

  async updateOne(query, data, options = { new: true }) {
    return await this.model.findOneAndUpdate(query, data, options);
  }

  async findByIdAndDelete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async deleteOne(query) {
    return await this.model.findOneAndDelete(query);
  }

  async countDocuments(query = {}) {
    return await this.model.countDocuments(query);
  }

  async aggregate(pipeline) {
    return await this.model.aggregate(pipeline);
  }
}

module.exports = BaseRepository;
